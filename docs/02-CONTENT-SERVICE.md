# Content Service Design

## Purpose
Provide a reusable service for fetching training content (words, images, audio) with smart exclusion to prevent showing the same content in consecutive sessions.

## Architecture

```
content-service/
├── index.ts              # Facade that exports all services
├── word-service.ts       # Word selection and management
├── image-service.ts      # Image selection (future)
├── audio-service.ts      # Audio selection (future)
└── exclusion-tracker.ts  # Content usage tracking
```

## Word Service

### Interface
```typescript
interface GetWordsOptions {
  count: number;           // How many words to return
  difficulty?: 'easy' | 'medium' | 'hard';
  categories?: string[];   // Filter by categories
  minLength?: number;      // Minimum word length
  maxLength?: number;      // Maximum word length
  userId: string;          // For exclusion tracking
}

class WordService {
  async getWords(options: GetWordsOptions): Promise<string[]>
}
```

### Implementation Steps

1. **Load Word Pool**
   ```typescript
   const pool = await loadWordsByDifficulty(difficulty);
   // Loads from: data/words/common.json, uncommon.json, rare.json
   ```

2. **Filter by Criteria**
   ```typescript
   let filtered = pool.filter(word => {
     if (categories && !categories.includes(word.category)) return false;
     if (minLength && word.length < minLength) return false;
     if (maxLength && word.length > maxLength) return false;
     return true;
   });
   ```

3. **Get Exclusion List**
   ```typescript
   const exclusionTracker = new ExclusionTracker();
   const recentWords = await exclusionTracker.getRecentContent(
     userId,
     'word',
     3  // last 3 sessions
   );
   ```

4. **Apply Exclusion**
   ```typescript
   filtered = filtered.filter(word =>
     !recentWords.includes(word.word)
   );
   ```

5. **Random Selection**
   ```typescript
   const shuffled = filtered.sort(() => Math.random() - 0.5);
   const selected = shuffled.slice(0, count).map(w => w.word);
   ```

6. **Track Usage**
   ```typescript
   await exclusionTracker.trackUsage(userId, 'word', selected);
   ```

7. **Return Words**
   ```typescript
   return selected;
   ```

## Exclusion Tracker

### Purpose
Track what content was shown to each user and when, to prevent repetition.

### Interface
```typescript
class ExclusionTracker {
  // Get recently used content
  async getRecentContent(
    userId: string,
    contentType: 'word' | 'image' | 'audio',
    lastNSessions: number
  ): Promise<string[]>

  // Track new usage
  async trackUsage(
    userId: string,
    contentType: 'word' | 'image' | 'audio',
    items: string[]
  ): Promise<void>
}
```

### Implementation

**Get Recent Content**:
```typescript
async getRecentContent(userId, contentType, lastNSessions) {
  const usageRecords = await prisma.contentUsage.findMany({
    where: { userId, contentType },
    orderBy: { usedAt: 'desc' },
    take: lastNSessions
  });

  const allItems: string[] = [];
  for (const record of usageRecords) {
    const items = JSON.parse(record.items);
    allItems.push(...items);
  }

  return [...new Set(allItems)];  // Remove duplicates
}
```

**Track Usage**:
```typescript
async trackUsage(userId, contentType, items) {
  await prisma.contentUsage.create({
    data: {
      userId,
      contentType,
      items: JSON.stringify(items),
      usedAt: new Date()
    }
  });
}
```

## Word Data Structure

### File: `data/words/common.json`
```json
[
  {
    "id": "w001",
    "word": "apple",
    "category": "food",
    "syllables": 2,
    "frequency": "common",
    "length": 5
  },
  {
    "id": "w002",
    "word": "banana",
    "category": "food",
    "syllables": 3,
    "frequency": "common",
    "length": 6
  }
]
```

### Categories
- **food**: apple, banana, pizza, bread, cheese
- **body**: hand, eye, foot, head, arm
- **furniture**: chair, table, sofa, bed, desk
- **nature**: tree, flower, mountain, river, ocean
- **animals**: dog, cat, elephant, bird, fish
- **clothing**: shirt, pants, shoes, hat, jacket
- **colors**: red, blue, green, yellow, purple
- **activities**: run, jump, swim, read, write
- **emotions**: happy, sad, angry, excited, calm
- **weather**: rain, snow, wind, sunny, cloudy
- **places**: park, school, home, store, library
- **verbs**: walk, talk, think, create, build
- **adjectives**: big, small, fast, slow, bright

### Difficulty Mapping
- **Easy**: `common.json` filtered by length 3-5
- **Medium**: `common.json` (5-8 letters) + some from `uncommon.json`
- **Hard**: `uncommon.json` + `rare.json` (8+ letters)

## Content Service Facade

### File: `lib/content-service/index.ts`
```typescript
import { WordService } from './word-service';

class ContentService {
  private wordService: WordService;

  constructor() {
    this.wordService = new WordService();
  }

  async getWords(options: GetWordsOptions): Promise<string[]> {
    return this.wordService.getWords(options);
  }

  // Future: getImages, getAudio
}

export const contentService = new ContentService();
```

### Usage in API
```typescript
// app/api/content/words/route.ts
import { contentService } from '@/lib/content-service';

export async function POST(request: Request) {
  const { count, difficulty, userId } = await request.json();

  const words = await contentService.getWords({
    count,
    difficulty,
    userId
  });

  return NextResponse.json({ words });
}
```

## Future Extensions

### Image Service
```typescript
interface GetImagesOptions {
  count: number;
  categories?: string[];
  userId: string;
}

class ImageService {
  async getImages(options: GetImagesOptions): Promise<string[]> {
    // Similar logic to WordService
    // Load from data/images/*.json
    // Track usage in ContentUsage
  }
}
```

### Audio Service
```typescript
interface GetAudioOptions {
  count: number;
  types?: ('sound' | 'music' | 'speech')[];
  userId: string;
}

class AudioService {
  async getAudio(options: GetAudioOptions): Promise<string[]> {
    // Similar logic to WordService
    // Load from data/audio/*.json
  }
}
```

## Performance Considerations

### Caching
- Word pools loaded once on server start
- Stored in memory (JSON files are small)
- No need for database queries for word data

### Database Queries
- ContentUsage queries limited by:
  - Index on `[userId, contentType, usedAt]`
  - `take: lastNSessions` limits rows returned
- Typical query: fetch 3 records × 20 words = 60 items

### Scaling
- Current: 500 words fits easily in memory
- Future: 10,000+ words still manageable
- Images/Audio: Store URLs, not files themselves
- Use CDN for media files (Vercel Blob, Cloudinary)

## Testing

### Unit Tests
```typescript
describe('WordService', () => {
  it('should return requested number of words', async () => {
    const words = await wordService.getWords({ count: 20, userId: 'test' });
    expect(words.length).toBe(20);
  });

  it('should exclude recently used words', async () => {
    // Use word A in session 1
    // Request words for session 2
    // Verify word A not in result
  });

  it('should filter by category', async () => {
    const words = await wordService.getWords({
      count: 10,
      categories: ['food'],
      userId: 'test'
    });
    // Verify all words are food-related
  });
});
```

### Integration Tests
```typescript
describe('Content API', () => {
  it('should return words via API', async () => {
    const response = await fetch('/api/content/words', {
      method: 'POST',
      body: JSON.stringify({ count: 20, userId: 'test' })
    });
    const data = await response.json();
    expect(data.words).toHaveLength(20);
  });
});
```

## Error Handling

### Insufficient Words Available
```typescript
if (filtered.length < count) {
  // Option 1: Return what we have
  return filtered.map(w => w.word);

  // Option 2: Relax exclusion (allow some recent words)
  // Option 3: Throw error and ask user to retry
}
```

### File Loading Errors
```typescript
try {
  const data = await fs.readFile('data/words/common.json', 'utf-8');
  return JSON.parse(data);
} catch (error) {
  console.error('Failed to load words:', error);
  return [];  // Fallback to empty array
}
```

### Database Errors
```typescript
try {
  await prisma.contentUsage.create({...});
} catch (error) {
  console.error('Failed to track usage:', error);
  // Don't block the training session
  // Log error for debugging
}
```

## Best Practices

1. **Always track usage**: Even if exclusion fails, track what was shown
2. **Graceful degradation**: If exclusion service fails, still return words
3. **Logging**: Log content selection for debugging adaptive difficulty
4. **Validation**: Validate word data structure on load
5. **Type safety**: Use TypeScript interfaces for all data structures
