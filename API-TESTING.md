# API Testing Guide - Phase 7

This document provides comprehensive testing instructions for the Content and Training Session API endpoints.

## Prerequisites

1. **Development server running**:
   ```bash
   npm run dev
   ```
   Server should be running at http://localhost:3000

2. **Database seeded with test users**:
   - alice@test.com (password: password123)
   - bob@test.com (password: password123)
   - charlie@test.com (password: password123)

3. **Test tool**: Use any of the following:
   - Browser + Developer Tools
   - Postman
   - Insomnia
   - curl (command line)

## Authentication Required

Both API endpoints require authentication. You must first sign in through the web interface:

1. Navigate to http://localhost:3000/login
2. Sign in with: `alice` / `password123`
3. Browser will receive authentication cookies automatically

## API Endpoint 1: POST /api/content/words

**Purpose**: Fetch words for training sessions with intelligent exclusion tracking.

### Test Case 1: Basic Word Fetching (Medium Difficulty)

**Request**:
```bash
curl -X POST http://localhost:3000/api/content/words \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "count": 20,
    "difficulty": "medium"
  }'
```

**Expected Response (200 OK)**:
```json
{
  "words": [
    {
      "word": "keyboard",
      "category": "technology",
      "length": 8
    },
    // ... 19 more words
  ],
  "metadata": {
    "count": 20,
    "requested": 20,
    "difficulty": "medium",
    "excludedCount": 30,
    "totalAvailable": 500,
    "filtersRelaxed": false,
    "timestamp": "2025-12-03T13:00:00.000Z"
  }
}
```

**What to verify**:
- ✅ Response status is 200
- ✅ Exactly 20 words returned
- ✅ All words have `word`, `category`, and `length` fields
- ✅ Metadata shows `difficulty: "medium"`
- ✅ `excludedCount` reflects words from last 3 sessions
- ✅ Response time < 500ms

---

### Test Case 2: Easy Difficulty with Filters

**Request**:
```json
{
  "count": 10,
  "difficulty": "easy",
  "categories": ["food", "animals"],
  "minLength": 3,
  "maxLength": 6
}
```

**Expected Response (200 OK)**:
```json
{
  "words": [
    {
      "word": "apple",
      "category": "food",
      "length": 5
    },
    {
      "word": "cat",
      "category": "animals",
      "length": 3
    },
    // ... more words from food/animals categories, length 3-6
  ],
  "metadata": {
    "count": 10,
    "requested": 10,
    "difficulty": "easy",
    "excludedCount": 0,
    "totalAvailable": 200,
    "filtersRelaxed": false,
    "timestamp": "2025-12-03T13:00:00.000Z"
  }
}
```

**What to verify**:
- ✅ All words are from "food" or "animals" categories
- ✅ All words have length between 3-6
- ✅ Exactly 10 words returned

---

### Test Case 3: Hard Difficulty

**Request**:
```json
{
  "count": 30,
  "difficulty": "hard"
}
```

**Expected Response (200 OK)**:
```json
{
  "words": [
    {
      "word": "serendipity",
      "category": "abstract",
      "length": 11
    },
    // ... 29 more difficult words
  ],
  "metadata": {
    "count": 30,
    "requested": 30,
    "difficulty": "hard",
    "excludedCount": 0,
    "totalAvailable": 300,
    "filtersRelaxed": false,
    "timestamp": "2025-12-03T13:00:00.000Z"
  }
}
```

**What to verify**:
- ✅ Words are from rare.json (harder vocabulary)
- ✅ Exactly 30 words returned

---

### Test Case 4: Validation Errors

#### Missing Required Field
**Request**:
```json
{
  "count": 20
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "Missing required fields: difficulty"
}
```

#### Invalid Difficulty
**Request**:
```json
{
  "count": 20,
  "difficulty": "extreme"
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "difficulty must be one of: easy, medium, hard"
}
```

#### Invalid Count Range
**Request**:
```json
{
  "count": 100,
  "difficulty": "medium"
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "count must be between 1 and 50"
}
```

#### Invalid Length Relationship
**Request**:
```json
{
  "count": 10,
  "difficulty": "easy",
  "minLength": 8,
  "maxLength": 4
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "minLength cannot be greater than maxLength"
}
```

---

### Test Case 5: Unauthorized Access

**Request**: Make request without authentication cookie

**Expected Response (401 Unauthorized)**:
```json
{
  "error": "Unauthorized - Please sign in to continue"
}
```

---

## API Endpoint 2: POST /api/training/save-session

**Purpose**: Save training session results and update user progress.

### Test Case 1: Complete Word Memory Session

**Request**:
```bash
curl -X POST http://localhost:3000/api/training/save-session \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookie>" \
  -d '{
    "trainingType": "word-memory",
    "configuration": {
      "difficulty": "medium",
      "wordCount": 20,
      "studyTime": 60,
      "recallTime": 120
    },
    "results": {
      "score": 85,
      "correctCount": 17,
      "incorrectCount": 2,
      "missedCount": 1,
      "timeSpent": 118,
      "studiedWords": ["apple", "banana", "cherry"],
      "recalledWords": ["apple", "banana", "orange"],
      "correctWords": ["apple", "banana"],
      "incorrectWords": ["orange"],
      "missedWords": ["cherry"]
    },
    "contentUsed": [
      {"word": "apple", "category": "food"},
      {"word": "banana", "category": "food"},
      {"word": "cherry", "category": "food"}
    ]
  }'
```

**Expected Response (201 Created)**:
```json
{
  "message": "Session saved successfully",
  "session": {
    "id": "clx...",
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

**What to verify**:
- ✅ Response status is 201 (Created)
- ✅ Session ID is returned (CUID format)
- ✅ Score matches submitted value (85)
- ✅ Accuracy calculated correctly: 17/(17+2) = 89.47%
- ✅ Performance level is "good" (75-89 range)
- ✅ Progress reflects updated values (totalSessions incremented)
- ✅ bestScore is max of all sessions
- ✅ averageScore is calculated correctly
- ✅ Response time < 1000ms

**Database Verification** (use `npx prisma studio`):
- ✅ New TrainingSession record created
- ✅ UserProgress record updated (or created if first session)
- ✅ ContentUsage record created with 3 words
- ✅ TrainingModule exists (created if it didn't exist)

---

### Test Case 2: First Session (New User)

**Request** (login as charlie first):
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "easy",
    "wordCount": 10,
    "studyTime": 60,
    "recallTime": 120
  },
  "results": {
    "score": 70,
    "correctCount": 7,
    "incorrectCount": 0,
    "missedCount": 3,
    "timeSpent": 95
  },
  "contentUsed": [
    {"word": "dog", "category": "animals"},
    {"word": "cat", "category": "animals"}
  ]
}
```

**Expected Response (201 Created)**:
```json
{
  "message": "Session saved successfully",
  "session": {
    "id": "clx...",
    "score": 70,
    "accuracy": 100,
    "performanceLevel": "fair",
    "createdAt": "2025-12-03T13:00:00.000Z"
  },
  "progress": {
    "totalSessions": 1,
    "bestScore": 70,
    "averageScore": 70,
    "currentStreak": 1,
    "longestStreak": 1
  }
}
```

**What to verify**:
- ✅ First session creates new UserProgress record
- ✅ totalSessions = 1
- ✅ bestScore = averageScore = 70
- ✅ currentStreak = 1
- ✅ Performance level is "fair" (60-74 range)

---

### Test Case 3: Excellent Performance

**Request**:
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "hard",
    "wordCount": 30,
    "studyTime": 60,
    "recallTime": 120
  },
  "results": {
    "score": 95,
    "correctCount": 28,
    "incorrectCount": 1,
    "missedCount": 1,
    "timeSpent": 110
  }
}
```

**Expected Response (201 Created)**:
```json
{
  "message": "Session saved successfully",
  "session": {
    "id": "clx...",
    "score": 95,
    "accuracy": 96.55,
    "performanceLevel": "excellent",
    "createdAt": "2025-12-03T13:00:00.000Z"
  },
  "progress": {
    "totalSessions": 5,
    "bestScore": 95,
    "averageScore": 89.0,
    "currentStreak": 5,
    "longestStreak": 5
  }
}
```

**What to verify**:
- ✅ Performance level is "excellent" (≥90)
- ✅ bestScore updated to 95
- ✅ averageScore recalculated with new session

---

### Test Case 4: Poor Performance

**Request**:
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "medium",
    "wordCount": 20,
    "studyTime": 60,
    "recallTime": 120
  },
  "results": {
    "score": 45,
    "correctCount": 9,
    "incorrectCount": 5,
    "missedCount": 6,
    "timeSpent": 120
  }
}
```

**Expected Response (201 Created)**:
```json
{
  "session": {
    "performanceLevel": "poor"
  }
}
```

**What to verify**:
- ✅ Performance level is "poor" (<60)
- ✅ Session still saved successfully
- ✅ Progress updated despite poor performance

---

### Test Case 5: Validation Errors

#### Missing Required Field
**Request**:
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "medium"
  }
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "Missing required fields: results"
}
```

#### Missing Score in Results
**Request**:
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "medium"
  },
  "results": {
    "timeSpent": 100
  }
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "results.score is required"
}
```

#### Score Out of Range
**Request**:
```json
{
  "trainingType": "word-memory",
  "configuration": {
    "difficulty": "medium"
  },
  "results": {
    "score": 150,
    "timeSpent": 100
  }
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": "score must be between 0 and 100"
}
```

---

### Test Case 6: Auto-Create Training Module

**Request** (new training type):
```json
{
  "trainingType": "pattern-recognition",
  "configuration": {
    "difficulty": "medium",
    "patternCount": 15
  },
  "results": {
    "score": 80,
    "timeSpent": 90
  }
}
```

**Expected Response (201 Created)**:
```json
{
  "message": "Session saved successfully",
  "session": {
    "score": 80,
    "performanceLevel": "good"
  }
}
```

**Database Verification**:
- ✅ New TrainingModule created with slug "pattern-recognition"
- ✅ Module name formatted as "Pattern Recognition"
- ✅ Category auto-detected as "pattern-recognition"

---

### Test Case 7: Unauthorized Access

**Request**: Make request without authentication cookie

**Expected Response (401 Unauthorized)**:
```json
{
  "error": "Unauthorized - Please sign in to continue"
}
```

---

## Performance Testing

### Content Words API
- **Target**: < 500ms response time
- **Test**: Fetch 50 words (maximum allowed)
- **Expected**: Should complete in < 500ms even with exclusion tracking

### Save Session API
- **Target**: < 1000ms response time
- **Test**: Save session with 30 words in contentUsed
- **Expected**: Transaction should complete in < 1000ms

Use browser DevTools Network tab to measure actual response times.

---

## Integration Testing

### Complete Training Flow

1. **Sign in**:
   - Go to http://localhost:3000/login
   - Sign in as alice / password123

2. **Fetch words**:
   ```javascript
   fetch('/api/content/words', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       count: 20,
       difficulty: 'medium'
     })
   })
   .then(r => r.json())
   .then(data => console.log('Words:', data))
   ```

3. **Save session**:
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
       contentUsed: data.words.slice(0, 20).map(w => ({
         word: w.word,
         category: w.category
       }))
     })
   })
   .then(r => r.json())
   .then(result => console.log('Session saved:', result))
   ```

4. **Verify exclusion**:
   - Fetch words again
   - Check that `metadata.excludedCount` has increased
   - Verify no words from previous session appear in new set

---

## Browser Console Testing

Open browser console at http://localhost:3000/dashboard and run:

```javascript
// Test 1: Fetch words
const testFetchWords = async () => {
  const response = await fetch('/api/content/words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      count: 20,
      difficulty: 'medium',
      categories: ['food', 'animals']
    })
  });
  const data = await response.json();
  console.log('Words Response:', data);
  return data;
};

// Test 2: Save session
const testSaveSession = async (words) => {
  const response = await fetch('/api/training/save-session', {
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
        score: Math.floor(Math.random() * 40) + 60, // Random 60-100
        correctCount: 17,
        incorrectCount: 2,
        missedCount: 1,
        timeSpent: 118
      },
      contentUsed: words.words.slice(0, 20)
    })
  });
  const data = await response.json();
  console.log('Session Response:', data);
  return data;
};

// Run tests
testFetchWords().then(testSaveSession);
```

---

## Success Criteria

All tests pass when:

✅ **Content Words API**:
- Returns correct number of words for all difficulty levels
- Applies filters correctly (categories, min/max length)
- Validates all input parameters
- Returns 401 for unauthenticated requests
- Returns 400 for invalid requests
- Excludes words from recent sessions
- Response time < 500ms

✅ **Save Session API**:
- Creates session record in database
- Updates/creates user progress correctly
- Calculates scores accurately (best, average)
- Determines performance level correctly
- Calculates accuracy when data provided
- Creates content usage records
- Auto-creates training modules
- Validates all input parameters
- Returns 401 for unauthenticated requests
- Returns 400 for invalid requests
- Response time < 1000ms

✅ **Integration**:
- Complete training flow works end-to-end
- Exclusion algorithm prevents word repetition
- Streak calculation works across sessions
- Multiple training types supported
- Data consistency maintained via transactions

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Ensure you're signed in. Check cookies in DevTools → Application → Cookies

### Issue: 500 Internal Server Error
**Solution**: Check server console for error logs. Likely database connection issue.

### Issue: Empty words array
**Solution**: Verify word JSON files exist in `data/words/` directory

### Issue: Score not updating
**Solution**: Check UserProgress table in Prisma Studio. Verify transaction succeeded.

### Issue: Slow response times
**Solution**: Check database indexes. Verify no N+1 query problems.

---

## Next Steps After Testing

1. Implement Word Memory training component (Phase 8)
2. Add more training modules
3. Implement adaptive difficulty
4. Add rate limiting to API routes
5. Add API request logging
6. Create API documentation with OpenAPI/Swagger
