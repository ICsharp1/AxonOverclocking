# Word Memory Training - Detailed Specification

## Overview
The Word Memory Challenge is the first training module. It tests and improves short-term memory through word recall exercises with adaptive difficulty.

## Training Flow

### 1. Introduction Phase
**Purpose**: Explain the training and prepare the user.

**UI Elements**:
- Brain emoji icon
- "Word Memory Challenge" title
- "How it works" section with numbered steps:
  1. Study 20 words for 60 seconds
  2. Recall as many words as you can in 60 seconds
  3. Get instant feedback and track your progress
- Info cards showing duration (2 minutes) and adaptive difficulty
- "Start Training" button

**User Actions**:
- Click "Start Training" → fetch words and begin
- Click "Back to Dashboard" → return to dashboard

### 2. Study Phase (60 seconds)
**Purpose**: User memorizes words.

**UI Elements**:
- "Study These Words" title
- Countdown timer (MM:SS format)
- Grid of 20 words (4 columns × 5 rows on desktop, 2 columns on mobile)
- Each word in a card with glassmorphism effect

**User Actions**:
- Read and memorize words
- No interaction needed
- Automatic transition to Recall Phase when timer hits 0

**Data**:
- Words fetched from `/api/content/words`
- 20 words selected based on difficulty
- Words excluded if used in last 3 sessions

### 3. Recall Phase (60 seconds)
**Purpose**: User types as many words as they remember.

**UI Elements**:
- "Type the Words You Remember" title
- Countdown timer
- Input field (auto-focused)
- List of recalled words (with × button to remove)
- Counter showing number of words recalled
- "Finish Early" button

**User Actions**:
- Type a word and press Enter
- Word added to "recalled words" list
- Input clears automatically
- Can remove words by clicking × button
- Click "Finish Early" → skip to results
- Automatic transition to Results Phase when timer hits 0

**Validation**:
- Trim whitespace
- Convert to lowercase for storage
- Prevent duplicate entries
- No validation against correct words (done in results)

### 4. Results Phase
**Purpose**: Show performance and save to database.

**UI Elements**:
- Emoji based on score (🎉 ≥80%, 👍 ≥60%, 💪 <60%)
- Congratulatory message
- Score card: X% (correct/total words)
- Accuracy card: X% (correct/recalled words)
- Total recalled card: X words
- Breakdown sections:
  - ✓ Correct Words (green badges)
  - ✗ Incorrect Words (red badges)
  - − Missed Words (yellow badges)
- "Train Again" button
- "Back to Dashboard" button

**User Actions**:
- Click "Train Again" → reset to intro phase
- Click "Back to Dashboard" → navigate to dashboard

**Calculations**:
```
score = (correctWords.length / totalWords.length) × 100
accuracy = (correctWords.length / recalledWords.length) × 100
correctWords = recalled words that were in original list
incorrectWords = recalled words that were NOT in original list
missedWords = original words that were NOT recalled
```

**Data Saved to Database**:
- Session record with full results
- Updated user progress (averages, best score)
- Content usage for exclusion tracking

## Data Structures

### Configuration
```typescript
{
  wordCount: 20,
  studyDuration: 60,
  recallDuration: 60,
  difficulty: 'medium'
}
```

### Results
```typescript
{
  words: string[],              // Original 20 words shown
  recalledWords: string[],      // Words user typed
  correctWords: string[],       // Recalled words that were correct
  incorrectWords: string[],     // Recalled words that were wrong
  missedWords: string[]         // Original words not recalled
}
```

### Session Data
```typescript
{
  userId: string,
  trainingModuleId: 'word-memory',
  configuration: Configuration,
  results: Results,
  score: number,                // 0-100
  accuracy: number,             // 0-100
  duration: 120,                // seconds (fixed at 2 min)
  performanceLevel: 'excellent' | 'good' | 'fair',
  status: 'completed'
}
```

## Adaptive Difficulty (Future Enhancement)

### Current Behavior
- Always shows 20 words
- Always medium difficulty words

### Planned Behavior
Based on user's performance, adjust next session:

**High Performance (score ≥ 80%)**:
- Increase word count by 5 (max 40)
- OR increase difficulty level (medium → hard)

**Low Performance (score < 40%)**:
- Decrease word count by 5 (min 10)
- OR decrease difficulty level (hard → medium)

**Implementation**:
1. After saving session, check score against progression rules
2. Update `currentDifficulty` in UserProgress
3. Next session reads from UserProgress to set difficulty

## Word Selection Algorithm

### Difficulty Levels
- **Easy**: 3-5 letters, common words (frequency: common)
- **Medium**: 5-8 letters, mix of common and uncommon
- **Hard**: 8+ letters, uncommon and rare words

### Exclusion Logic
1. Get last 3 ContentUsage records for this user and 'word' type
2. Collect all words shown in those sessions
3. Filter word pool to exclude those words
4. If not enough words available, fallback to allowing recent words

### Word Pool Structure
```json
{
  "id": "w001",
  "word": "apple",
  "category": "food",
  "syllables": 2,
  "frequency": "common",
  "length": 5
}
```

Categories: food, body, furniture, nature, animals, clothing, colors, activities, emotions, weather, places, verbs, adjectives

## Performance Metrics

### Score
- **Excellent**: 80-100% (16-20 words correct)
- **Good**: 60-79% (12-15 words correct)
- **Fair**: 0-59% (0-11 words correct)

### Typical Performance
- Beginner: 30-50% (6-10 words)
- Intermediate: 50-70% (10-14 words)
- Advanced: 70-90% (14-18 words)
- Expert: 90-100% (18-20 words)

## UI/UX Design Principles

### Visual Hierarchy
1. Timer (most important during timed phases)
2. Primary action area (words grid or input)
3. Secondary info (instructions, counters)
4. Navigation (back button)

### Color Coding
- **Green**: Correct answers, success states
- **Red**: Incorrect answers, errors
- **Yellow**: Missed items, warnings
- **Purple**: Primary actions, brand color
- **White/transparent**: Glassmorphism cards

### Animations
- Smooth transitions between phases (fade in/out)
- Timer countdown (color changes at 10 seconds remaining)
- Blob animations in background (7s loop)
- Button hover effects (scale, shadow, translate)

### Accessibility
- Auto-focus on input field in recall phase
- Clear, large fonts
- High contrast text on glass backgrounds
- Keyboard navigation (Enter to submit words)
- Responsive design (mobile, tablet, desktop)

## Technical Implementation

### Component State
```typescript
const [phase, setPhase] = useState<'intro' | 'study' | 'recall' | 'results'>('intro');
const [words, setWords] = useState<string[]>([]);
const [timeLeft, setTimeLeft] = useState(60);
const [recalledWords, setRecalledWords] = useState<string[]>([]);
const [currentInput, setCurrentInput] = useState('');
const [results, setResults] = useState({...});
```

### Timer Logic
```typescript
useEffect(() => {
  if (phase !== 'study' && phase !== 'recall') return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        // Transition to next phase
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [phase]);
```

### API Calls
1. **Fetch Words**: `POST /api/content/words`
2. **Save Session**: `POST /api/training/save-session`

## Testing Checklist

### Functional Tests
- ✅ Words load successfully
- ✅ Timer counts down correctly
- ✅ Phase transitions work (study → recall → results)
- ✅ Word input and removal works
- ✅ No duplicate words can be entered
- ✅ Results calculate correctly
- ✅ Session saves to database
- ✅ Progress updates correctly
- ✅ Content exclusion works

### UI Tests
- ✅ Responsive on mobile, tablet, desktop
- ✅ Animations smooth on all devices
- ✅ Glassmorphism renders correctly
- ✅ Timer visible and readable
- ✅ All buttons functional
- ✅ Back navigation works

### Edge Cases
- ✅ User recalls 0 words (accuracy = 0, not NaN)
- ✅ User recalls more words than shown
- ✅ User types gibberish/invalid words
- ✅ Timer expires exactly at transition
- ✅ Network failure during word fetch
- ✅ Network failure during save
- ✅ Not enough unique words available

## Future Enhancements

### V2 Features
- [ ] Adaptive difficulty based on performance
- [ ] Category-specific word sets (choose food, animals, etc.)
- [ ] Adjustable session duration (5, 10, 15 min)
- [ ] Multiplayer/competitive mode
- [ ] Audio pronunciation of words
- [ ] Image associations for each word

### V3 Features
- [ ] Spaced repetition algorithm
- [ ] Progress charts and analytics
- [ ] Daily challenges
- [ ] Achievements/badges
- [ ] Leaderboards
- [ ] Export progress data
