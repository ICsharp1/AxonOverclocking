/**
 * Training Session Save API Route
 *
 * POST /api/training/save-session
 *
 * Saves training session results and updates user progress atomically.
 * Uses Prisma transactions to ensure data consistency.
 *
 * Features:
 * - Authentication required
 * - Comprehensive validation of session data
 * - Atomic transaction (session + progress + content usage)
 * - Automatic training module creation if not exists
 * - Progress calculation (best score, average score)
 * - Streak calculation
 * - Performance level determination
 *
 * Performance target: < 1000ms response time
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAuth,
  validateRequiredFields,
  validateRange,
  handleApiError,
  successResponse,
  errorResponse,
} from '@/app/api/utils';

/**
 * Request body type definition
 */
interface SaveSessionRequestBody {
  trainingType: string; // e.g., 'word-memory'
  configuration: {
    difficulty: string;
    wordCount?: number;
    timeLimit?: number;
    [key: string]: any;
  };
  results: {
    score: number;
    correctCount?: number;
    incorrectCount?: number;
    missedCount?: number;
    timeSpent: number;
    [key: string]: any;
  };
  contentUsed?: Array<{
    word: string;
    category: string;
    [key: string]: any;
  }>;
}

/**
 * POST handler - Save training session and update progress
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const { session, response } = await requireAuth();
    if (!session) return response;

    // 2. Parse request body
    let body: SaveSessionRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON in request body');
    }

    // 3. Validate required fields
    const requiredValidation = validateRequiredFields(body, [
      'trainingType',
      'configuration',
      'results',
    ]);
    if (!requiredValidation.valid) {
      return errorResponse(requiredValidation.error!);
    }

    // 4. Validate results structure
    if (typeof body.results !== 'object' || Array.isArray(body.results)) {
      return errorResponse('results must be an object');
    }

    if (body.results.score === undefined || body.results.score === null) {
      return errorResponse('results.score is required');
    }

    if (body.results.timeSpent === undefined || body.results.timeSpent === null) {
      return errorResponse('results.timeSpent is required');
    }

    // 5. Validate score range (0-100)
    const scoreValidation = validateRange(body.results.score, 'score', 0, 100);
    if (!scoreValidation.valid) {
      return errorResponse(scoreValidation.error!);
    }

    // 6. Validate configuration structure
    if (typeof body.configuration !== 'object' || Array.isArray(body.configuration)) {
      return errorResponse('configuration must be an object');
    }

    // 7. Validate trainingType
    if (typeof body.trainingType !== 'string' || body.trainingType.trim() === '') {
      return errorResponse('trainingType must be a non-empty string');
    }

    // 8. Validate contentUsed if provided
    if (body.contentUsed !== undefined) {
      if (!Array.isArray(body.contentUsed)) {
        return errorResponse('contentUsed must be an array');
      }
    }

    // 9. Use Prisma transaction to save session and update progress atomically
    const result = await prisma.$transaction(async (tx) => {
      // Find or create training module
      const slug = body.trainingType.toLowerCase().replace(/\s+/g, '-');
      let trainingModule = await tx.trainingModule.findUnique({
        where: { slug },
      });

      if (!trainingModule) {
        // Create new training module
        trainingModule = await tx.trainingModule.create({
          data: {
            name: formatModuleName(body.trainingType),
            slug,
            description: `${formatModuleName(body.trainingType)} training module`,
            category: determineCategoryFromType(body.trainingType),
            configuration: body.configuration,
            isActive: true,
          },
        });
      }

      // Calculate performance level
      const performanceLevel = calculatePerformanceLevel(body.results.score);

      // Calculate accuracy if not provided
      let accuracy: number | null = null;
      if (body.results.correctCount !== undefined && body.results.incorrectCount !== undefined) {
        const totalAttempted = body.results.correctCount + body.results.incorrectCount;
        accuracy = totalAttempted > 0 ? (body.results.correctCount / totalAttempted) * 100 : 0;
      }

      // Create training session
      const trainingSession = await tx.trainingSession.create({
        data: {
          userId: session.user.id,
          trainingModuleId: trainingModule.id,
          configuration: body.configuration,
          results: body.results,
          score: body.results.score,
          accuracy,
          duration: Math.round(body.results.timeSpent),
          performanceLevel,
          status: 'completed',
        },
      });

      // Track content usage if provided
      if (body.contentUsed && body.contentUsed.length > 0) {
        await tx.contentUsage.create({
          data: {
            userId: session.user.id,
            contentType: 'word',
            items: body.contentUsed,
          },
        });
      }

      // Get current progress to calculate new values
      const currentProgress = await tx.userProgress.findUnique({
        where: {
          userId_trainingModuleId: {
            userId: session.user.id,
            trainingModuleId: trainingModule.id,
          },
        },
      });

      // Calculate new progress values
      const newTotalSessions = (currentProgress?.totalSessions || 0) + 1;
      const newBestScore = Math.max(currentProgress?.bestScore || 0, body.results.score);
      const newAverageScore = currentProgress
        ? (currentProgress.averageScore * currentProgress.totalSessions + body.results.score) /
          newTotalSessions
        : body.results.score;

      // Update or create user progress
      const userProgress = await tx.userProgress.upsert({
        where: {
          userId_trainingModuleId: {
            userId: session.user.id,
            trainingModuleId: trainingModule.id,
          },
        },
        update: {
          totalSessions: newTotalSessions,
          bestScore: newBestScore,
          averageScore: Math.round(newAverageScore * 10) / 10, // Round to 1 decimal
          lastSessionAt: new Date(),
          currentDifficulty: body.configuration.difficulty
            ? { level: body.configuration.difficulty }
            : (currentProgress?.currentDifficulty || { level: 'medium' }),
        },
        create: {
          userId: session.user.id,
          trainingModuleId: trainingModule.id,
          totalSessions: 1,
          bestScore: body.results.score,
          averageScore: body.results.score,
          currentDifficulty: body.configuration.difficulty
            ? { level: body.configuration.difficulty }
            : { level: 'medium' },
          lastSessionAt: new Date(),
        },
      });

      return { trainingSession, userProgress, trainingModule };
    });

    // 10. Calculate streak (outside transaction for better performance)
    const streak = await calculateStreak(session.user.id);

    // 11. Update streak in progress (non-blocking)
    prisma.userProgress
      .update({
        where: {
          userId_trainingModuleId: {
            userId: session.user.id,
            trainingModuleId: result.trainingModule.id,
          },
        },
        data: {
          currentStreak: streak,
          longestStreak: Math.max(result.userProgress.longestStreak, streak),
        },
      })
      .catch((error) => {
        console.error('Failed to update streak:', error);
      });

    // 12. Return success response
    return successResponse(
      {
        message: 'Session saved successfully',
        session: {
          id: result.trainingSession.id,
          score: result.trainingSession.score,
          accuracy: result.trainingSession.accuracy,
          performanceLevel: result.trainingSession.performanceLevel,
          createdAt: result.trainingSession.createdAt.toISOString(),
        },
        progress: {
          totalSessions: result.userProgress.totalSessions,
          bestScore: result.userProgress.bestScore,
          averageScore: result.userProgress.averageScore,
          currentStreak: streak,
          longestStreak: Math.max(result.userProgress.longestStreak, streak),
        },
      },
      201
    );
  } catch (error: any) {
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return handleApiError(error, 'Duplicate session detected');
    }

    if (error.code === 'P2003') {
      return handleApiError(error, 'Invalid reference in session data');
    }

    // Generic error handling
    return handleApiError(error, 'Failed to save training session');
  }
}

/**
 * Helper: Format module name from type
 * Example: 'word-memory' -> 'Word Memory'
 */
function formatModuleName(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper: Determine category from training type
 */
function determineCategoryFromType(type: string): string {
  const lowerType = type.toLowerCase();

  if (lowerType.includes('memory') || lowerType.includes('recall')) {
    return 'memory';
  }

  if (lowerType.includes('attention') || lowerType.includes('focus')) {
    return 'attention';
  }

  if (lowerType.includes('speed') || lowerType.includes('reaction')) {
    return 'processing-speed';
  }

  if (lowerType.includes('pattern') || lowerType.includes('visual')) {
    return 'pattern-recognition';
  }

  return 'general';
}

/**
 * Helper: Calculate performance level from score
 */
function calculatePerformanceLevel(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

/**
 * Helper: Calculate current streak for a user
 *
 * A streak is the number of consecutive days the user has completed at least one session.
 */
async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all sessions ordered by date (most recent first)
    const sessions = await prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (sessions.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD format)
    const uniqueDates = Array.from(
      new Set(
        sessions.map((s) => {
          const date = new Date(s.createdAt);
          return date.toISOString().split('T')[0];
        })
      )
    );

    // Check if there's a session today or yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      // Streak is broken - last session was before yesterday
      return 0;
    }

    // Count consecutive days
    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        streak++;
        currentDate = prevDate;
      } else {
        // Gap in streak
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Disallow other HTTP methods
 */
export async function GET() {
  return errorResponse('Method not allowed. Use POST instead.', 405);
}

export async function PUT() {
  return errorResponse('Method not allowed. Use POST instead.', 405);
}

export async function DELETE() {
  return errorResponse('Method not allowed. Use POST instead.', 405);
}

export async function PATCH() {
  return errorResponse('Method not allowed. Use POST instead.', 405);
}
