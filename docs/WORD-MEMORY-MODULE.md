# Word Memory Training Module Documentation

## Overview

The Word Memory training module is a 4-phase neuroplasticity-based exercise designed to strengthen working memory through timed word memorization and recall challenges.

## URL

```
http://localhost:3001/training/word-memory
```

## Architecture

### Component Location
```
app/training/word-memory/page.tsx
```

### Component Type
Client-side React component ('use client')

### Dependencies
- Next.js 15.1.3 App Router
- NextAuth.js for authentication
- Design system UI components
- Content service API
- Training session API

## 4-Phase Pattern

### Phase 1: Intro
- User selects difficulty (Easy/Medium/Hard)
- Shows instructions and estimated time
- Fetches words from API when starting

### Phase 2: Study
- Displays words in responsive grid
- Countdown timer (45-75 seconds based on difficulty)
- Auto-advances to recall when timer expires

### Phase 3: Recall
- User types remembered words
- Validates input (no duplicates, case-insensitive)
- Shows recalled words count

### Phase 4: Results
- Calculates score and accuracy
- Shows correct/incorrect/missed word breakdown
- Saves session to database
- Updates user progress

## Difficulty Levels

| Difficulty | Words | Time | Description |
|------------|-------|------|-------------|
| Easy | 15 | 75s | Beginner friendly |
| Medium | 20 | 60s | Standard challenge |
| Hard | 25 | 45s | Expert mode |

## Scoring Formulas

```typescript
// Score: Percentage of original words correctly recalled
score = (correctWords / totalWords) × 100

// Accuracy: Percentage of recalled words that were correct
accuracy = (correctWords / recalledWords) × 100

// Correct: Words in both lists
correct = recalledWords ∩ originalWords

// Incorrect: Recalled but not in original
incorrect = recalledWords - originalWords

// Missed: Original but not recalled
missed = originalWords - recalledWords
```

## API Integration

### Fetch Words
```typescript
POST /api/content/words
Content-Type: application/json

{
  "count": 20,
  "difficulty": "medium"
}
```

### Save Session
```typescript
POST /api/training/save-session
Content-Type: application/json

{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "medium",
    "wordCount": 20,
    "timeLimit": 60
  },
  "results": {
    "score": 85,
    "accuracy": 94,
    "correctCount": 17,
    "incorrectCount": 1,
    "missedCount": 3,
    "timeSpent": 125
  },
  "contentUsed": [
    { "word": "apple", "category": "food" }
  ]
}
```

## State Management

```typescript
// Phase control
const [phase, setPhase] = useState<Phase>('intro');

// Difficulty selection
const [difficulty, setDifficulty] = useState<Difficulty>('medium');

// Content data
const [words, setWords] = useState<Word[]>([]);
const [recalledWords, setRecalledWords] = useState<string[]>([]);

// Timer
const [timeRemaining, setTimeRemaining] = useState(60);

// Results
const [results, setResults] = useState<Results | null>(null);

// UI state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

## Key Features

### Timer Implementation
- Uses setInterval for countdown
- Proper cleanup in useEffect
- Color-coded urgency (green/yellow/red)
- Auto-advances phases

### Input Validation
- Trims whitespace
- Case-insensitive comparison
- Duplicate prevention
- Empty input rejection
- Real-time error feedback

### Edge Case Handling
- Zero recalls: accuracy = 0 (not NaN)
- Empty input: silently ignored
- API failures: user-friendly errors
- Rapid clicks: disabled states
- Navigation: cleanup timers

### Responsive Design
- Mobile: 2 columns
- Tablet: 3-4 columns
- Desktop: 4-5 columns
- Touch-friendly buttons
- Readable font sizes

## Database Records

### TrainingSession
```typescript
{
  userId: string;
  trainingModuleId: string;
  configuration: {
    difficulty: string;
    wordCount: number;
    timeLimit: number;
  };
  results: {
    score: number;
    accuracy: number;
    correctCount: number;
    incorrectCount: number;
    missedCount: number;
    timeSpent: number;
  };
  score: number;
  accuracy: number | null;
  duration: number;
  performanceLevel: string;
  status: 'completed';
}
```

### UserProgress
```typescript
{
  userId: string;
  trainingModuleId: string;
  totalSessions: number;
  bestScore: number;
  averageScore: number;
  currentDifficulty: { level: string };
  currentStreak: number;
  longestStreak: number;
  lastSessionAt: Date;
}
```

### ContentUsage
```typescript
{
  userId: string;
  contentType: 'word';
  items: Array<{ word: string; category: string }>;
  usedAt: Date;
}
```

## Neuroplasticity Principles

1. **Progressive Overload**: 3 difficulty levels
2. **Time Pressure**: Countdown creates cognitive stress
3. **Immediate Feedback**: Real-time validation
4. **Spaced Repetition**: Content exclusion
5. **Adaptive Challenge**: User-controlled difficulty
6. **Measurable Progress**: Score tracking
7. **Motivation**: Performance-based messages

## Motivational Messages

| Score Range | Message |
|-------------|---------|
| 90-100% | "Outstanding! Your memory is razor-sharp!" |
| 75-89% | "Excellent work! Keep pushing those limits!" |
| 60-74% | "Good job! You're building stronger neural pathways!" |
| 40-59% | "Nice effort! Every session makes you stronger!" |
| 0-39% | "Keep practicing! Neuroplasticity takes time!" |

## Performance Levels

| Score Range | Level |
|-------------|-------|
| 90-100% | excellent |
| 75-89% | good |
| 60-74% | fair |
| 0-59% | poor |

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management (auto-focus input)
- High contrast text
- Touch-friendly targets (min 44px)

## Testing URLs

```
Development: http://localhost:3001/training/word-memory
Production:  https://your-domain.vercel.app/training/word-memory
```

## Common Issues

### Issue: Timer not counting down
**Solution**: Check useEffect cleanup, ensure phase is 'study'

### Issue: Duplicate words allowed
**Solution**: Verify toLowerCase() comparison

### Issue: NaN in accuracy
**Solution**: Check division by zero handling

### Issue: Session not saving
**Solution**: Verify API endpoint, check authentication

### Issue: Words repeat in consecutive sessions
**Solution**: Ensure ContentUsage is being tracked

## Customization Examples

### Change difficulty settings
```typescript
const DIFFICULTIES: DifficultyConfig[] = [
  { level: 'easy', words: 10, time: 90, description: 'Relaxed' },
  { level: 'medium', words: 20, time: 60, description: 'Standard' },
  { level: 'hard', words: 30, time: 40, description: 'Intense' },
];
```

### Add custom categories
```typescript
const response = await fetch('/api/content/words', {
  method: 'POST',
  body: JSON.stringify({
    count: 20,
    difficulty: 'medium',
    categories: ['food', 'animals'], // Filter by categories
  }),
});
```

### Change timer colors
```typescript
const getTimerVariant = (seconds: number) => {
  if (seconds > 40) return 'default'; // Green
  if (seconds > 15) return 'warning'; // Yellow
  return 'danger'; // Red
};
```

## Related Documentation

- [Design System](../components/ui/README.md)
- [Content Service](./02-CONTENT-SERVICE.md)
- [API Routes](../app/api/README.md)
- [Database Schema](../prisma/schema.prisma)

## Version History

- **v1.0** (2025-12-03): Initial implementation
  - 4-phase pattern complete
  - API integration functional
  - Responsive design implemented
  - Edge cases handled

---

**Maintained by**: Training Builder Agent
**Last Updated**: 2025-12-03
