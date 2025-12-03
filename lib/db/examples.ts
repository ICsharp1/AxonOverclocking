/**
 * Axon Overclocking - Database Query Examples
 *
 * This file demonstrates common query patterns for the brain training application.
 * These examples show how to work with the 5 core models and JSON fields with type safety.
 *
 * NOTE: This file is for documentation purposes only. Copy patterns into your
 * actual API routes and services as needed.
 */

import { db } from '@/lib/db';
import type {
  WordMemoryConfig,
  WordMemoryResults,
  SessionConfiguration,
  AdaptiveDifficulty,
  TypedTrainingModule,
  TypedTrainingSession,
  TypedUserProgress,
} from '@/lib/db/types';

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Find user by email (for authentication)
 */
export async function findUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  });
}

/**
 * Create new user with hashed password
 */
export async function createUser(data: {
  email: string;
  username: string;
  password: string;
  name?: string;
}) {
  return await db.user.create({
    data,
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
    },
  });
}

/**
 * Get user with their progress summary
 */
export async function getUserWithProgress(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    include: {
      userProgress: {
        include: {
          trainingModule: true,
        },
      },
    },
  });
}

// ============================================================================
// TRAINING MODULE QUERIES
// ============================================================================

/**
 * Get all active training modules
 */
export async function getActiveTrainingModules() {
  const modules = await db.trainingModule.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  // Type-safe casting for JSON configuration
  return modules as unknown as TypedTrainingModule<WordMemoryConfig>[];
}

/**
 * Get training module by slug with type-safe configuration
 */
export async function getTrainingModuleBySlug(slug: string) {
  const module = await db.trainingModule.findUnique({
    where: { slug },
  });

  if (!module) return null;

  // Cast to specific training type for type safety
  return module as unknown as TypedTrainingModule<WordMemoryConfig>;
}

/**
 * Create or update a training module
 */
export async function upsertTrainingModule(data: {
  slug: string;
  name: string;
  description: string;
  category: string;
  configuration: WordMemoryConfig;
}) {
  return await db.trainingModule.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      configuration: data.configuration as any,
    },
    create: data as any,
  });
}

// ============================================================================
// TRAINING SESSION QUERIES
// ============================================================================

/**
 * Create a training session with results
 */
export async function createTrainingSession(data: {
  userId: string;
  trainingModuleId: string;
  configuration: SessionConfiguration;
  results: WordMemoryResults;
  score: number;
  accuracy: number | null;
  duration: number;
  performanceLevel: string;
}) {
  return await db.trainingSession.create({
    data: {
      ...data,
      status: 'completed',
      configuration: data.configuration as any,
      results: data.results as any,
    },
  });
}

/**
 * Get user's recent sessions for a specific training module
 */
export async function getUserRecentSessions(
  userId: string,
  trainingModuleId: string,
  limit: number = 10
) {
  const sessions = await db.trainingSession.findMany({
    where: {
      userId,
      trainingModuleId,
      status: 'completed',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return sessions as unknown as TypedTrainingSession<SessionConfiguration, WordMemoryResults>[];
}

/**
 * Get user's session history with pagination
 */
export async function getUserSessionHistory(
  userId: string,
  options: {
    skip?: number;
    take?: number;
    trainingModuleId?: string;
  } = {}
) {
  return await db.trainingSession.findMany({
    where: {
      userId,
      trainingModuleId: options.trainingModuleId,
    },
    include: {
      trainingModule: {
        select: {
          name: true,
          slug: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: options.skip || 0,
    take: options.take || 20,
  });
}

/**
 * Calculate performance statistics for a user
 */
export async function calculateUserStats(userId: string, trainingModuleId: string) {
  const sessions = await db.trainingSession.findMany({
    where: {
      userId,
      trainingModuleId,
      status: 'completed',
    },
    orderBy: { createdAt: 'desc' },
    select: {
      score: true,
      accuracy: true,
      duration: true,
      createdAt: true,
    },
  });

  if (sessions.length === 0) {
    return null;
  }

  const totalSessions = sessions.length;
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions;
  const bestScore = Math.max(...sessions.map(s => s.score));
  const averageDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions;

  return {
    totalSessions,
    averageScore,
    bestScore,
    averageDuration,
    recentSessions: sessions.slice(0, 5),
  };
}

// ============================================================================
// USER PROGRESS QUERIES
// ============================================================================

/**
 * Get or create user progress for a training module
 */
export async function getOrCreateUserProgress(userId: string, trainingModuleId: string) {
  const existing = await db.userProgress.findUnique({
    where: {
      userId_trainingModuleId: {
        userId,
        trainingModuleId,
      },
    },
  });

  if (existing) {
    return existing as TypedUserProgress<AdaptiveDifficulty>;
  }

  const created = await db.userProgress.create({
    data: {
      userId,
      trainingModuleId,
      currentDifficulty: {
        level: 'medium',
        adaptiveScore: 0,
        sessionsAtCurrentLevel: 0,
      } as AdaptiveDifficulty as any,
    },
  });

  return created as TypedUserProgress<AdaptiveDifficulty>;
}

/**
 * Update user progress after completing a session
 */
export async function updateUserProgress(
  userId: string,
  trainingModuleId: string,
  sessionScore: number,
  newDifficulty?: AdaptiveDifficulty
) {
  const progress = await getOrCreateUserProgress(userId, trainingModuleId);

  const newTotalSessions = progress.totalSessions + 1;
  const newAverageScore =
    (progress.averageScore * progress.totalSessions + sessionScore) / newTotalSessions;
  const newBestScore = Math.max(progress.bestScore, sessionScore);

  // Calculate streak (simplified - would need date checking in production)
  const newStreak = progress.currentStreak + 1;
  const newLongestStreak = Math.max(progress.longestStreak, newStreak);

  return await db.userProgress.update({
    where: {
      userId_trainingModuleId: {
        userId,
        trainingModuleId,
      },
    },
    data: {
      totalSessions: newTotalSessions,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      currentDifficulty: newDifficulty ? (newDifficulty as any) : undefined,
      lastSessionAt: new Date(),
    },
  });
}

/**
 * Get dashboard data for a user (all progress records)
 */
export async function getUserDashboard(userId: string) {
  return await db.userProgress.findMany({
    where: { userId },
    include: {
      trainingModule: true,
    },
    orderBy: { lastSessionAt: 'desc' },
  });
}

// ============================================================================
// CONTENT USAGE QUERIES (for Exclusion Algorithm)
// ============================================================================

/**
 * Get content items used in last N sessions for a user
 * This supports the exclusion algorithm: don't show content from last 3 sessions
 */
export async function getRecentlyUsedContent(
  userId: string,
  contentType: string,
  lastNSessions: number = 3
) {
  const recentUsage = await db.contentUsage.findMany({
    where: {
      userId,
      contentType,
    },
    orderBy: { usedAt: 'desc' },
    take: lastNSessions,
    select: {
      items: true,
    },
  });

  // Flatten all items into a single array and remove duplicates
  const allItems = recentUsage.flatMap(usage => usage.items as string[]);
  return Array.from(new Set(allItems));
}

/**
 * Record content usage for a session
 */
export async function recordContentUsage(
  userId: string,
  contentType: string,
  items: string[]
) {
  return await db.contentUsage.create({
    data: {
      userId,
      contentType,
      items: items as any,
    },
  });
}

/**
 * Clean up old content usage records (data retention)
 * Keep only last 10 sessions per user per content type
 */
export async function cleanupOldContentUsage(userId: string, contentType: string) {
  const allUsage = await db.contentUsage.findMany({
    where: { userId, contentType },
    orderBy: { usedAt: 'desc' },
    select: { id: true },
  });

  // Keep only the 10 most recent records
  const toDelete = allUsage.slice(10).map(usage => usage.id);

  if (toDelete.length > 0) {
    await db.contentUsage.deleteMany({
      where: {
        id: { in: toDelete },
      },
    });
  }

  return toDelete.length;
}

// ============================================================================
// COMPLEX QUERIES
// ============================================================================

/**
 * Get comprehensive training analytics for a user
 */
export async function getUserTrainingAnalytics(userId: string) {
  const [progress, recentSessions, totalSessions] = await Promise.all([
    db.userProgress.findMany({
      where: { userId },
      include: { trainingModule: true },
    }),
    db.trainingSession.findMany({
      where: { userId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { trainingModule: true },
    }),
    db.trainingSession.count({
      where: { userId, status: 'completed' },
    }),
  ]);

  return {
    progress,
    recentSessions,
    totalSessions,
    totalTrainingsStarted: progress.length,
  };
}

/**
 * Check if user can start a new session (rate limiting)
 * Prevents spam by checking last session time
 */
export async function canUserStartSession(
  userId: string,
  minimumMinutesBetweenSessions: number = 1
) {
  const lastSession = await db.trainingSession.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (!lastSession) return true;

  const minutesSinceLastSession =
    (Date.now() - lastSession.createdAt.getTime()) / 1000 / 60;

  return minutesSinceLastSession >= minimumMinutesBetweenSessions;
}
