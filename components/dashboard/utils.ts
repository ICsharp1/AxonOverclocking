/**
 * Utility functions for dashboard components
 */

/**
 * Calculate current training streak from sessions
 * A streak is maintained by training at least once per day
 */
export function calculateStreak(sessions: Array<{ createdAt: Date | string }>): number {
  if (sessions.length === 0) return 0;

  // Convert string dates to Date objects and sort by date descending
  const sortedSessions = sessions
    .map(s => ({
      createdAt: typeof s.createdAt === 'string' ? new Date(s.createdAt) : s.createdAt
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Get unique training days
  const trainingDays = new Set<string>();
  sortedSessions.forEach(session => {
    const sessionDate = new Date(session.createdAt);
    sessionDate.setHours(0, 0, 0, 0);
    trainingDays.add(sessionDate.toISOString().split('T')[0]);
  });

  const uniqueDays = Array.from(trainingDays).sort().reverse();

  // Check streak starting from today or yesterday
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  // If no training today, check if there was training yesterday
  const today = checkDate.toISOString().split('T')[0];
  if (!uniqueDays.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days
  for (let i = 0; i < uniqueDays.length; i++) {
    const expectedDate = checkDate.toISOString().split('T')[0];
    if (uniqueDays[i] === expectedDate) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format date as relative time (e.g., "2 days ago", "Yesterday", "Today")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

/**
 * Format date as readable string (e.g., "Monday, Dec 3, 2025")
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get badge variant based on difficulty level
 */
export function getDifficultyVariant(difficulty: 'easy' | 'medium' | 'hard'): 'success' | 'warning' | 'error' {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
    default:
      return 'warning';
  }
}

/**
 * Get performance badge variant based on score
 */
export function getPerformanceVariant(score: number): 'success' | 'warning' | 'error' | 'info' {
  if (score >= 90) return 'success';
  if (score >= 70) return 'info';
  if (score >= 50) return 'warning';
  return 'error';
}

/**
 * Format score as percentage with one decimal place
 */
export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}
