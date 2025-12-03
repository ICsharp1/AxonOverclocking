# API Reference - Axon Overclocking

Quick reference for API endpoints in the brain training application.

---

## Base URL

Development: `http://localhost:3000`
Production: `https://your-domain.vercel.app`

---

## Authentication

All API endpoints require authentication via NextAuth session cookies. Users must be signed in through the web interface before calling these APIs.

**Authentication Method**: Session cookies (automatic in browser)

**Unauthenticated Response**:
```json
{
  "error": "Unauthorized - Please sign in to continue"
}
```

---

## Endpoints

### 1. Fetch Content Words

Retrieve words for training sessions with intelligent exclusion tracking.

**Endpoint**: `POST /api/content/words`

**Request Body**:
```typescript
{
  count: number;           // Required: 1-50
  difficulty: string;      // Required: 'easy' | 'medium' | 'hard'
  categories?: string[];   // Optional: filter by categories
  minLength?: number;      // Optional: min word length (1-20)
  maxLength?: number;      // Optional: max word length (1-20)
}
```

**Example Request**:
```javascript
fetch('/api/content/words', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    count: 20,
    difficulty: 'medium',
    categories: ['food', 'animals'],
    minLength: 4,
    maxLength: 8
  })
})
```

**Success Response (200)**:
```json
{
  "words": [
    {
      "word": "elephant",
      "category": "animals",
      "length": 8
    }
  ],
  "metadata": {
    "count": 20,
    "requested": 20,
    "difficulty": "medium",
    "excludedCount": 15,
    "totalAvailable": 500,
    "filtersRelaxed": false,
    "timestamp": "2025-12-03T13:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Invalid request (validation errors)
- `401`: Not authenticated
- `500`: Server error

---

### 2. Save Training Session

Save training session results and update user progress.

**Endpoint**: `POST /api/training/save-session`

**Request Body**:
```typescript
{
  trainingType: string;     // Required: e.g., 'word-memory'
  configuration: {          // Required: training config
    difficulty: string;
    [key: string]: any;     // Extensible
  };
  results: {                // Required: session results
    score: number;          // Required: 0-100
    timeSpent: number;      // Required: seconds
    [key: string]: any;     // Extensible
  };
  contentUsed?: Array<{     // Optional: content tracking
    word: string;
    category: string;
  }>;
}
```

**Example Request**:
```javascript
fetch('/api/training/save-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trainingType: 'word-memory',
    configuration: {
      difficulty: 'medium',
      wordCount: 20,
      studyTime: 60,
      recallTime: 120
    },
    results: {
      score: 85,
      correctCount: 17,
      incorrectCount: 2,
      missedCount: 1,
      timeSpent: 118
    },
    contentUsed: [
      { word: 'apple', category: 'food' },
      { word: 'banana', category: 'food' }
    ]
  })
})
```

**Success Response (201)**:
```json
{
  "message": "Session saved successfully",
  "session": {
    "id": "clx123...",
    "score": 85,
    "accuracy": 89.47,
    "performanceLevel": "good",
    "createdAt": "2025-12-03T13:00:00.000Z"
  },
  "progress": {
    "totalSessions": 4,
    "bestScore": 90,
    "averageScore": 87.5,
    "currentStreak": 4,
    "longestStreak": 4
  }
}
```

**Error Responses**:
- `400`: Invalid request (validation errors)
- `401`: Not authenticated
- `500`: Server error

---

## Data Types

### Word Object
```typescript
{
  word: string;      // The word itself
  category: string;  // Category (food, animals, etc.)
  length: number;    // Word length in characters
}
```

### Difficulty Level
```typescript
type Difficulty = 'easy' | 'medium' | 'hard';
```

### Performance Level
```typescript
type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor';
```

**Calculation**:
- `excellent`: score ≥ 90
- `good`: score ≥ 75
- `fair`: score ≥ 60
- `poor`: score < 60

---

## Error Handling

### Error Response Format
```json
{
  "error": "User-friendly error message"
}
```

### Common Errors

**400 Bad Request**:
```json
{
  "error": "Missing required fields: difficulty"
}
```

**401 Unauthorized**:
```json
{
  "error": "Unauthorized - Please sign in to continue"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch words"
}
```

---

## Usage Examples

### Complete Training Flow

```javascript
// Step 1: Fetch words
const wordsResponse = await fetch('/api/content/words', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    count: 20,
    difficulty: 'medium'
  })
});

const { words } = await wordsResponse.json();

// Step 2: User completes training...
// (study phase, recall phase)

// Step 3: Save session results
const sessionResponse = await fetch('/api/training/save-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trainingType: 'word-memory',
    configuration: {
      difficulty: 'medium',
      wordCount: words.length
    },
    results: {
      score: calculatedScore,
      timeSpent: sessionDuration,
      // ... other results
    },
    contentUsed: words.map(w => ({
      word: w.word,
      category: w.category
    }))
  })
});

const { session, progress } = await sessionResponse.json();
console.log(`Session saved! Score: ${session.score}, Best: ${progress.bestScore}`);
```

---

## Performance

| Endpoint | Target Response Time | Typical |
|----------|---------------------|---------|
| GET /api/content/words | < 500ms | 100-300ms |
| POST /api/training/save-session | < 1000ms | 200-500ms |

---

## Rate Limits

**Current**: No rate limits enforced

**Future**: 100 requests per minute per user

---

## Versioning

**Current Version**: v1 (no version in URL)

**Future**: Will use `/api/v1/...` pattern when v2 is introduced

---

## Testing

**Interactive Test Interface**: http://localhost:3000/api-test.html

**Test Credentials**:
- Username: `alice`
- Password: `password123`

---

## Notes

1. **Exclusion Tracking**: Words are automatically excluded from the last 3 training sessions to prevent repetition.

2. **Extensibility**: The `configuration` and `results` objects accept any additional fields, making it easy to add new training modules without API changes.

3. **Auto-Create Modules**: Training modules are automatically created on first session save for that training type.

4. **Streak Calculation**: Streaks count consecutive days with at least one completed session. A streak continues if you train today or yesterday.

5. **Accuracy Calculation**: If `correctCount` and `incorrectCount` are provided in results, accuracy is automatically calculated as `correctCount / (correctCount + incorrectCount) × 100`.

---

## Support

For detailed testing instructions, see [API-TESTING.md](../API-TESTING.md)

For implementation details, see [PHASE-7-SUMMARY.md](../PHASE-7-SUMMARY.md)
