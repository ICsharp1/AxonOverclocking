/**
 * Dashboard Page (Protected Route)
 *
 * Main dashboard for authenticated users displaying:
 * - User welcome message
 * - Training statistics and progress
 * - Available training modules
 * - User progress for each module
 */

import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { NavBar } from '@/components/layout/NavBar';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  WelcomeSection,
  StatsOverview,
  TrainingModulesGrid,
  calculateStreak,
} from '@/components/dashboard';

/**
 * Fetch user statistics from the database
 */
async function getUserStats(userId: string) {
  const sessions = await prisma.trainingSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      score: true,
    },
  });

  const totalSessions = sessions.length;
  const currentStreak = calculateStreak(sessions);
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const lastTraining = sessions[0]?.createdAt || null;

  return {
    totalSessions,
    currentStreak,
    totalScore,
    lastTraining,
  };
}

/**
 * Fetch available training modules
 * Currently returns hardcoded modules (will be database-driven in future)
 */
async function getTrainingModules() {
  // For Phase 6, return hardcoded modules
  // In Phase 8+, these will be fetched from database
  return [
    {
      id: 'word-memory',
      name: 'Word Memory',
      description: 'Memorize and recall lists of words to strengthen working memory and enhance cognitive retention',
      difficulty: 'medium' as const,
      estimatedTime: 5,
    },
    // Additional modules will be added in Phase 8
  ];
}

/**
 * Fetch user progress for all training modules
 */
async function getUserProgress(userId: string) {
  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: {
      trainingModule: true,
    },
  });

  return progress.map((p) => ({
    moduleId: p.trainingModuleId,
    bestScore: p.bestScore,
    totalSessions: p.totalSessions,
    averageScore: p.averageScore,
    lastPlayed: p.lastSessionAt,
  }));
}

/**
 * Dashboard Page Component
 */
export default async function DashboardPage() {
  // Require authentication - will redirect to login if not authenticated
  const session = await requireAuth();

  // Fetch all dashboard data
  const [userStats, trainingModules, userProgress] = await Promise.all([
    getUserStats(session.user.id),
    getTrainingModules(),
    getUserProgress(session.user.id),
  ]);

  return (
    <>
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation Bar */}
      <NavBar
        user={{
          name: session.user.name || session.user.username,
          username: session.user.username,
        }}
      />

      {/* Main Dashboard Content */}
      <PageContainer maxWidth="2xl">
        {/* Welcome Section */}
        <WelcomeSection
          user={{
            name: session.user.name || session.user.username,
            username: session.user.username,
          }}
        />

        {/* Stats Overview */}
        <StatsOverview stats={userStats} />

        {/* Training Modules Grid */}
        <TrainingModulesGrid
          modules={trainingModules}
          userProgress={userProgress}
        />
      </PageContainer>
    </>
  );
}
