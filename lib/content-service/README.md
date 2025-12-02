# Content Service

The Content Service is an intelligent content management system for the Axon Overclocking brain training application. It manages reusable content (words, images, audio) with smart exclusion algorithms to ensure users never see the same content in consecutive training sessions.

## Architecture Overview

The content service consists of three main components:

### 1. WordService
The main service class that handles word selection, filtering, and caching.

**Responsibilities:**
- Load words from JSON files
- Filter by difficulty, category, and length
- Exclude recently used words
- Random selection
- Track usage for future exclusion
- Graceful degradation when words are insufficient

### 2. ExclusionTracker
Manages the exclusion algorithm to prevent content repetition.

**Responsibilities:**
- Query ContentUsage table for last 3 sessions
- Build exclusion sets for O(1) lookup
- Track new content usage
- Provide exclusion statistics

### 3. Type Definitions
Comprehensive TypeScript types for type safety and documentation.

## Quick Start

### Basic Usage

```typescript
import { contentService } from '@/lib/content-service';

// Get 20 medium difficulty words for a user
const words = await contentService.getWords({
  count: 20,
  difficulty: 'medium',
  userId: session.user.id
});

// Use the words in your training module
console.log(words); // [{ word: 'apple', category: 'food', length: 5 }, ...]
```

### Advanced Filtering

```typescript
// Get words with specific categories and length constraints
const words = await contentService.getWords({
  count: 15,
  difficulty: 'easy',
  userId: session.user.id,
  categories: ['food', 'animals'],
  minLength: 4,
  maxLength: 7
});
```

### Get Selection Metadata

```typescript
import { contentService } from '@/lib/content-service';

const result = await contentService.getWordsWithMetadata({
  count: 20,
  difficulty: 'hard',
  userId: session.user.id
});

console.log(result.words); // Array of Word objects
console.log(result.metadata);
// {
//   requested: 20,
//   returned: 20,
//   excluded: 45,
//   totalAvailable: 110,
//   filtersRelaxed: false
// }
```

## API Reference

### `contentService.getWords(options)`

Selects words based on provided options with intelligent exclusion.

**Parameters:**
- `options.count` (number) - Number of words to retrieve
- `options.difficulty` ('easy' | 'medium' | 'hard') - Difficulty level
- `options.userId` (string) - User ID for exclusion tracking
- `options.categories` (string[], optional) - Filter by categories
- `options.minLength` (number, optional) - Minimum word length
- `options.maxLength` (number, optional) - Maximum word length

**Returns:** `Promise<Word[]>`

**Example:**
```typescript
const words = await contentService.getWords({
  count: 20,
  difficulty: 'medium',
  userId: 'user_123',
  categories: ['food', 'animals'],
  minLength: 4,
  maxLength: 8
});
```

### `contentService.getWordsWithMetadata(options)`

Same as `getWords()` but returns detailed metadata about the selection.

**Returns:** `Promise<WordSelectionResult>`

```typescript
interface WordSelectionResult {
  words: Word[];
  metadata: {
    requested: number;
    returned: number;
    excluded: number;
    totalAvailable: number;
    filtersRelaxed: boolean;
  };
}
```

### `contentService.getExclusionStats(userId)`

Get statistics about content exclusion for a user.

**Returns:** `Promise<{ totalSessions: number, recentSessions: number, excludedCount: number }>`

**Example:**
```typescript
const stats = await contentService.getExclusionStats('user_123');
console.log(`User has completed ${stats.totalSessions} sessions`);
console.log(`Currently excluding ${stats.excludedCount} words`);
```

## Word Database Structure

Words are stored in three JSON files in `data/words/`:

### Difficulty Mapping

- **Easy** (`common.json`) - 200+ words
  - 3-7 letters
  - High frequency, everyday words
  - Categories: food, animals, objects, nature, body, home, weather, actions, emotions, places

- **Medium** (`uncommon.json`) - 200+ words
  - 5-10 letters
  - Less common but familiar words
  - Categories: animals, food, nature, weather, technology, science, geography, professions, abstract

- **Hard** (`rare.json`) - 100+ words
  - 6-15 letters
  - Advanced vocabulary
  - Categories: science, academic, technology, abstract, technical, uncommon

### JSON Format

```json
[
  {
    "word": "cat",
    "category": "animals",
    "length": 3
  },
  {
    "word": "elephant",
    "category": "animals",
    "length": 8
  }
]
```

## Exclusion Algorithm

The exclusion algorithm prevents showing the same content in consecutive sessions:

### How It Works

1. **Query Recent Sessions**: When words are requested, the system queries the `ContentUsage` table for the user's last 3 sessions

2. **Build Exclusion Set**: All words from those sessions are added to a `Set<string>` for O(1) lookup

3. **Filter Words**: During word selection, any word in the exclusion set is removed from available options

4. **Track New Usage**: After words are selected and shown to the user, a new `ContentUsage` record is created

5. **Automatic Rotation**: As new sessions are added, old sessions naturally fall out of the exclusion window (after 3 sessions)

### Example Timeline

```
Session 1: Shows words [apple, cat, dog, tree, sun]
Session 2: Excludes session 1 words
Session 3: Excludes sessions 1-2 words
Session 4: Excludes sessions 2-4 words (session 1 no longer excluded!)
```

### Database Schema

```prisma
model ContentUsage {
  id          String   @id @default(cuid())
  userId      String
  contentType String   // 'word', 'image', 'audio'
  items       Json     // Array of content items
  usedAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, contentType, usedAt])
}
```

## Edge Cases and Graceful Degradation

The content service handles various edge cases gracefully:

### 1. Insufficient Unique Words

**Problem:** User has seen most words in their difficulty/category combo in last 3 sessions.

**Solution:** Progressive filter relaxation:
1. Relax length constraints
2. Relax category constraints
3. Allow some excluded words
4. Use all available words

```typescript
// System logs this progression:
// "WordService: Insufficient words after filtering. Attempting to relax filters..."
// "WordService: Relaxed length constraints"
// "WordService: Allowing excluded words due to insufficient unique words"
```

### 2. New User (No History)

**Problem:** No ContentUsage records exist for the user.

**Solution:** Exclusion tracker returns empty set, allowing selection from full word pool.

### 3. Restrictive Filters

**Problem:** Category + length constraints leave too few words.

**Solution:** System warns and relaxes constraints progressively. `metadata.filtersRelaxed` will be `true`.

### 4. Database Unavailable

**Problem:** Cannot query ContentUsage table.

**Solution:** ExclusionTracker catches error, logs warning, returns empty exclusion set. Selection continues without exclusion.

### 5. Invalid Difficulty

**Problem:** Requested difficulty doesn't exist.

**Solution:** WordService throws descriptive error:
```
Error: Invalid difficulty: extreme. Must be 'easy', 'medium', or 'hard'
```

## Performance Optimization

### Caching Strategy

**In-Memory Cache:**
- Word JSON files are cached in a `Map<DifficultyLevel, Word[]>`
- Cache persists for the lifetime of the application
- Reduces file I/O to first request only

**Cache Invalidation:**
- In development: Manual invalidation via `contentService.clearCache()`
- In production: Cache cleared on server restart

**Session-Level Cache:**
- Exclusion sets are computed per request
- Not cached to ensure fresh data

### Database Optimization

**Indexes:**
```prisma
@@index([userId, contentType, usedAt])
```

**Query Optimization:**
- Only fetch necessary fields (`select: { items: true }`)
- Limit queries to exact number needed (`take: sessionCount`)
- Order by usedAt DESC for most recent sessions

### Performance Targets

- Word selection: **<100ms** (typically 5-20ms)
- Handles **1000+ concurrent users**
- Scales to **10,000+ words** per difficulty
- Database queries use indexes for O(log n) lookup

## Extensibility for Future Content Types

The content service is designed to support multiple content types:

### Current Implementation
- Words (implemented)

### Future Content Types
- Images
- Audio clips
- Video clips
- Question banks

### Extending the Service

```typescript
// Example: ImageService
class ImageService extends IContentService<Image> {
  private exclusionTracker: ExclusionTracker;

  constructor() {
    this.exclusionTracker = new ExclusionTracker({
      contentType: ContentType.IMAGE,
      sessionCount: 3
    });
  }

  async getContent(options: GetImagesOptions): Promise<Image[]> {
    // Similar logic to WordService
  }
}
```

The `ExclusionTracker` already supports any content type via the `contentType` parameter.

## Testing

### Manual Testing

```typescript
// scripts/test-content-service.ts
import { contentService } from '@/lib/content-service';

async function testContentService() {
  // Test basic selection
  const words = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: 'test_user_123'
  });

  console.log(`Selected ${words.length} words`);

  // Test exclusion
  const words2 = await contentService.getWords({
    count: 20,
    difficulty: 'easy',
    userId: 'test_user_123'
  });

  // Verify no duplicates between sessions
  const set1 = new Set(words.map(w => w.word));
  const set2 = new Set(words2.map(w => w.word));
  const intersection = [...set1].filter(w => set2.has(w));

  console.log(`Duplicate words: ${intersection.length}`);
  console.log('Should be 0 for effective exclusion');
}
```

### Unit Testing

```typescript
describe('WordService', () => {
  it('should return requested number of words', async () => {
    const words = await contentService.getWords({
      count: 10,
      difficulty: 'easy',
      userId: 'test_user'
    });

    expect(words).toHaveLength(10);
  });

  it('should filter by category', async () => {
    const words = await contentService.getWords({
      count: 10,
      difficulty: 'easy',
      userId: 'test_user',
      categories: ['food']
    });

    expect(words.every(w => w.category === 'food')).toBe(true);
  });

  // Add more tests...
});
```

## Troubleshooting

### Words Are Repeating

**Check:**
1. Is ContentUsage table being populated? Run: `await contentService.getExclusionStats(userId)`
2. Are there enough words in the difficulty level?
3. Is the user completing more than 3 sessions very quickly?

**Solution:**
- Increase `sessionCount` in ExclusionTracker constructor
- Add more words to JSON files
- Check database indexes

### "Failed to load words" Error

**Check:**
1. Do the JSON files exist in `data/words/`?
2. Is the JSON format valid?
3. Are file permissions correct?

**Solution:**
- Verify files exist: `ls data/words/`
- Validate JSON: Use a JSON validator
- Check file paths in WordService constructor

### Slow Performance

**Check:**
1. Are database indexes present?
2. Is caching working?
3. How many concurrent users?

**Solution:**
- Run: `npx prisma db push` to ensure indexes exist
- Clear cache and reload: `contentService.clearCache()`
- Monitor with: `console.log(result.metadata)`

## Best Practices

### 1. Always Use the Singleton

```typescript
// ✅ Good
import { contentService } from '@/lib/content-service';

// ❌ Bad
import { WordService } from '@/lib/content-service';
const service = new WordService(); // Creates duplicate cache
```

### 2. Handle Insufficient Words Gracefully

```typescript
const result = await contentService.getWordsWithMetadata({
  count: 20,
  difficulty: 'hard',
  userId: session.user.id
});

if (result.metadata.returned < result.metadata.requested) {
  console.warn('Could not get enough words');
  // Handle gracefully in UI
}
```

### 3. Don't Block on Usage Tracking

The service automatically tracks usage asynchronously. Don't wait for it:

```typescript
// ✅ Good - Service handles tracking internally
const words = await contentService.getWords(options);
// Continue with words immediately

// ❌ Bad - Don't manually track
await contentService.trackUsage(userId, words);
```

### 4. Use Categories for Themed Training

```typescript
// Create themed sessions
const foodWords = await contentService.getWords({
  count: 15,
  difficulty: 'easy',
  userId: session.user.id,
  categories: ['food']
});

const natureWords = await contentService.getWords({
  count: 15,
  difficulty: 'easy',
  userId: session.user.id,
  categories: ['nature', 'animals']
});
```

## Future Enhancements

Potential improvements for future versions:

1. **Adaptive Difficulty**: Automatically adjust difficulty based on user performance
2. **Personalized Content**: Learn user preferences for categories
3. **Spaced Repetition**: Intentionally re-show words at optimal intervals
4. **Multi-Language Support**: Add word databases for other languages
5. **Custom Word Lists**: Allow users to create custom training word sets
6. **Content Recommendations**: Suggest optimal word sets based on user history

## Contributing

When adding new words to the database:

1. Follow the JSON structure exactly
2. Ensure `length` field matches actual word length
3. Use appropriate categories
4. Distribute words evenly across categories
5. Verify all words are spelled correctly
6. Test with the service after adding

## License

Part of the Axon Overclocking brain training application.
