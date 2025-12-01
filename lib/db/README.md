# Database Layer Documentation

This directory contains the database configuration, types, and query patterns for the Axon Overclocking brain training application.

## Overview

The database layer is built with:
- **Prisma ORM** (v6.19.0) - Type-safe database client
- **SQLite** (development) - Fast local database
- **PostgreSQL** (production on Vercel) - Scalable cloud database

## Core Architecture

### 5 Core Models

1. **User** - User accounts with NextAuth v5 integration
2. **TrainingModule** - Training definitions (Word Memory, Pattern Recognition, etc.)
3. **TrainingSession** - Individual session records with results
4. **UserProgress** - Aggregated user progress per training module
5. **ContentUsage** - Content shown to users (for smart exclusion)

### NextAuth Models

- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

## JSON Extensibility Pattern

The schema uses JSON fields strategically to allow adding new training types without database migrations:

- `TrainingModule.configuration` - Training-specific settings
- `TrainingSession.results` - Training-specific results
- `UserProgress.currentDifficulty` - Adaptive difficulty state

**Benefits:**
- Add new training modules without schema changes
- Store training-specific data flexibly
- Maintain type safety at the application layer

**TypeScript types** for all JSON fields are defined in `types/index.ts`.

## Performance Optimization

### Indexes

The schema includes critical indexes for common query patterns:

```prisma
// ContentUsage: Fast exclusion queries
@@index([userId, contentType, usedAt])

// TrainingSession: User session history
@@index([userId, createdAt])

// UserProgress: User progress lookup
@@index([userId, trainingModuleId])
```

### Query Patterns

See `examples.ts` for optimized query patterns including:
- User authentication queries
- Session history with pagination
- Content exclusion algorithm
- Progress tracking and analytics

## Files

- `index.ts` - Singleton Prisma Client instance
- `types/index.ts` - TypeScript types for JSON fields
- `examples.ts` - Common query patterns and examples
- `README.md` - This file

## Usage

### Import the Database Client

```typescript
import { db } from '@/lib/db';

// Query users
const users = await db.user.findMany();

// Create a session
const session = await db.trainingSession.create({
  data: {
    userId: 'user-id',
    trainingModuleId: 'module-id',
    configuration: { difficulty: 'medium' },
    results: { /* ... */ },
    score: 85.0,
    duration: 120,
    performanceLevel: 'good',
    status: 'completed',
  },
});
```

### Type-Safe JSON Fields

```typescript
import type {
  WordMemoryConfig,
  WordMemoryResults,
  AdaptiveDifficulty
} from '@/lib/db/types';

// Type-safe configuration
const config: WordMemoryConfig = {
  studyTime: 60,
  recallTime: 120,
  difficulties: {
    easy: { wordCount: 10, categories: ['common'] },
    medium: { wordCount: 20, categories: ['common', 'uncommon'] },
    hard: { wordCount: 30, categories: ['uncommon', 'rare'] },
  },
  scoring: {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 0,
  },
};

// Type-safe results
const results: WordMemoryResults = {
  studiedWords: ['apple', 'banana', 'cherry'],
  recalledWords: ['apple', 'banana'],
  correctWords: ['apple', 'banana'],
  incorrectWords: [],
  missedWords: ['cherry'],
};
```

## Common Operations

### Create a Training Session

```typescript
import { createTrainingSession } from '@/lib/db/examples';

await createTrainingSession({
  userId: session.user.id,
  trainingModuleId: 'word-memory-id',
  configuration: {
    difficulty: 'medium',
    wordCount: 20,
    studyTime: 60,
    recallTime: 120,
  },
  results: {
    studiedWords: [...],
    recalledWords: [...],
    correctWords: [...],
    incorrectWords: [],
    missedWords: [...],
  },
  score: 85.0,
  accuracy: 100.0,
  duration: 115,
  performanceLevel: 'good',
});
```

### Update User Progress

```typescript
import { updateUserProgress } from '@/lib/db/examples';

await updateUserProgress(
  userId,
  trainingModuleId,
  sessionScore,
  {
    level: 'medium',
    adaptiveScore: 85.0,
    readyForHard: true,
    sessionsAtCurrentLevel: 5,
  }
);
```

### Content Exclusion

```typescript
import { getRecentlyUsedContent, recordContentUsage } from '@/lib/db/examples';

// Get content from last 3 sessions to exclude
const excludedWords = await getRecentlyUsedContent(userId, 'word', 3);

// After showing content, record usage
await recordContentUsage(userId, 'word', shownWords);
```

## Database Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration (development)
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open database GUI
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

## Seed Data

The seed script (`prisma/seed.ts`) creates:

- **3 test users:**
  - alice@test.com - Experienced user (3 sessions, avg 86.67)
  - bob@test.com - Intermediate user (1 session, score 50.0)
  - charlie@test.com - New user (no sessions)

- **1 training module:**
  - Word Memory with full configuration

- **4 training sessions** with realistic results

- **2 progress records** showing different skill levels

- **4 content usage records** for testing exclusion

**All test accounts use password:** `password123`

## Environment Variables

```bash
# .env file
DATABASE_URL="file:./dev.db"  # SQLite (development)
# DATABASE_URL="postgresql://..." # PostgreSQL (production)
```

## SQLite vs PostgreSQL

The schema works with both SQLite (development) and PostgreSQL (production).

**Key differences handled:**
- SQLite uses `TEXT` for JSON fields
- PostgreSQL uses `JSONB` for JSON fields
- Prisma automatically handles these differences in migrations

## Migration to PostgreSQL (Production)

When deploying to Vercel with PostgreSQL:

1. Update `DATABASE_URL` in production environment variables
2. Run `npx prisma migrate deploy` to apply migrations
3. Optionally run seed script to create initial training modules

**Note:** Do not migrate user data from development SQLite to production.

## Data Retention

Consider implementing data retention policies for:

- **ContentUsage** - Keep last 10 sessions per user per content type
- **TrainingSession** - Archive sessions older than 1 year
- **Inactive Users** - Delete accounts inactive for 2+ years

See `cleanupOldContentUsage()` in `examples.ts` for a cleanup pattern.

## Best Practices

1. **Always use the singleton client** from `lib/db/index.ts`
2. **Type JSON fields** using types from `lib/db/types/index.ts`
3. **Use transactions** for operations that update multiple tables
4. **Include relations** only when needed (avoid over-fetching)
5. **Use select** to limit fields returned (better performance)
6. **Index frequently queried fields** (already done for core queries)
7. **Validate JSON field contents** at the application layer

## Example: Complete Session Save Flow

```typescript
import { db } from '@/lib/db';
import type { WordMemoryResults, AdaptiveDifficulty } from '@/lib/db/types';

async function saveTrainingSessionComplete(
  userId: string,
  trainingModuleId: string,
  results: WordMemoryResults,
  score: number
) {
  // Use transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    // 1. Create session record
    const session = await tx.trainingSession.create({
      data: {
        userId,
        trainingModuleId,
        configuration: { difficulty: 'medium' },
        results: results as any,
        score,
        accuracy: 100,
        duration: 120,
        performanceLevel: score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'fair',
        status: 'completed',
      },
    });

    // 2. Record content usage
    await tx.contentUsage.create({
      data: {
        userId,
        contentType: 'word',
        items: results.studiedWords as any,
      },
    });

    // 3. Update user progress
    const progress = await tx.userProgress.findUnique({
      where: {
        userId_trainingModuleId: { userId, trainingModuleId },
      },
    });

    if (progress) {
      const newTotal = progress.totalSessions + 1;
      const newAvg = (progress.averageScore * progress.totalSessions + score) / newTotal;

      await tx.userProgress.update({
        where: { id: progress.id },
        data: {
          totalSessions: newTotal,
          averageScore: newAvg,
          bestScore: Math.max(progress.bestScore, score),
          currentStreak: progress.currentStreak + 1,
          longestStreak: Math.max(progress.longestStreak, progress.currentStreak + 1),
          lastSessionAt: new Date(),
        },
      });
    } else {
      await tx.userProgress.create({
        data: {
          userId,
          trainingModuleId,
          totalSessions: 1,
          averageScore: score,
          bestScore: score,
          currentStreak: 1,
          longestStreak: 1,
          currentDifficulty: {
            level: 'medium',
            adaptiveScore: score,
          } as AdaptiveDifficulty as any,
          lastSessionAt: new Date(),
        },
      });
    }

    return session;
  });
}
```

## Troubleshooting

**Issue:** Prisma Client not found
```bash
npx prisma generate
```

**Issue:** Migration conflicts
```bash
npx prisma migrate reset  # Development only!
```

**Issue:** Type errors with JSON fields
- Ensure you're using types from `lib/db/types/index.ts`
- Cast JSON fields: `results as any` when writing
- Type assertion when reading: `as WordMemoryResults`

**Issue:** SQLite locked
- Close Prisma Studio
- Restart development server
- Check for running database connections

## Future Enhancements

- Add soft delete for user data (GDPR compliance)
- Implement database backups for PostgreSQL
- Add database connection pooling for production
- Create views for complex analytics queries
- Add full-text search for content (PostgreSQL only)

## Related Documentation

- [Prisma Schema](../../prisma/schema.prisma)
- [Seed Script](../../prisma/seed.ts)
- [Content Service](../content-service/README.md) (to be created)
- [API Routes](../../app/api/) (to be created)
