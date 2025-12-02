/**
 * ExclusionTracker Class
 *
 * Manages the intelligent exclusion algorithm that prevents showing the same content
 * in consecutive training sessions. This is a critical component for user experience,
 * ensuring that users don't see repetitive content.
 *
 * Algorithm:
 * 1. Query ContentUsage table for user's last N sessions
 * 2. Extract all content items from those sessions
 * 3. Build an exclusion set for O(1) lookup
 * 4. Provide this set to content services for filtering
 */

import { prisma } from '@/lib/prisma';
import { ContentType, Word, ExclusionTrackerConfig } from './types';

export class ExclusionTracker {
  private contentType: ContentType;
  private sessionCount: number;

  /**
   * Create a new ExclusionTracker
   *
   * @param config - Configuration for the tracker
   */
  constructor(config: ExclusionTrackerConfig) {
    this.contentType = config.contentType;
    this.sessionCount = config.sessionCount || 3;
  }

  /**
   * Get a set of content items (words) that were used in the user's recent sessions
   *
   * This method queries the ContentUsage table and builds an exclusion set of words
   * that should not be shown to the user to avoid repetition.
   *
   * @param userId - The user's ID
   * @returns Set of words that were recently used
   */
  async getRecentlyUsedWords(userId: string): Promise<Set<string>> {
    try {
      // Query the last N sessions for this user
      // We order by usedAt DESC to get the most recent sessions first
      const recentUsage = await prisma.contentUsage.findMany({
        where: {
          userId,
          contentType: this.contentType,
        },
        orderBy: {
          usedAt: 'desc',
        },
        take: this.sessionCount,
        select: {
          items: true, // JSON field containing array of content items
        },
      });

      // Build exclusion set from all content items in recent sessions
      const excludedWords = new Set<string>();

      for (const usage of recentUsage) {
        // items is a JSON field containing an array of Word objects
        const words = usage.items as unknown as Word[];

        for (const wordObj of words) {
          excludedWords.add(wordObj.word);
        }
      }

      return excludedWords;
    } catch (error) {
      // If database is unavailable, log error and return empty set
      // This allows the system to continue without exclusion rather than failing
      console.error('ExclusionTracker: Failed to query recent content usage:', error);
      return new Set<string>();
    }
  }

  /**
   * Track content usage for a session
   *
   * This creates a ContentUsage record that will be used for future exclusion.
   * Should be called after content is shown to the user.
   *
   * @param userId - The user's ID
   * @param items - Array of content items (words) shown in this session
   * @returns Promise that resolves when tracking is complete
   */
  async trackUsage(userId: string, items: Word[]): Promise<void> {
    try {
      await prisma.contentUsage.create({
        data: {
          userId,
          contentType: this.contentType,
          items: items as any, // Prisma will serialize this to JSON
          usedAt: new Date(),
        },
      });
    } catch (error) {
      // Log error but don't throw - tracking failure shouldn't break the app
      console.error('ExclusionTracker: Failed to track content usage:', error);
    }
  }

  /**
   * Get statistics about content exclusion for a user
   *
   * Useful for debugging and monitoring the exclusion system.
   *
   * @param userId - The user's ID
   * @returns Statistics about the user's content usage
   */
  async getExclusionStats(userId: string): Promise<{
    totalSessions: number;
    recentSessions: number;
    excludedCount: number;
  }> {
    try {
      // Get total number of sessions
      const totalSessions = await prisma.contentUsage.count({
        where: {
          userId,
          contentType: this.contentType,
        },
      });

      // Get recent sessions
      const recentUsage = await prisma.contentUsage.findMany({
        where: {
          userId,
          contentType: this.contentType,
        },
        orderBy: {
          usedAt: 'desc',
        },
        take: this.sessionCount,
        select: {
          items: true,
        },
      });

      // Count excluded words
      const excludedWords = new Set<string>();
      for (const usage of recentUsage) {
        const words = usage.items as unknown as Word[];
        for (const wordObj of words) {
          excludedWords.add(wordObj.word);
        }
      }

      return {
        totalSessions,
        recentSessions: recentUsage.length,
        excludedCount: excludedWords.size,
      };
    } catch (error) {
      console.error('ExclusionTracker: Failed to get exclusion stats:', error);
      return {
        totalSessions: 0,
        recentSessions: 0,
        excludedCount: 0,
      };
    }
  }

  /**
   * Clear all content usage records for a user
   *
   * WARNING: This is a destructive operation. Only use for testing or user request.
   *
   * @param userId - The user's ID
   */
  async clearUsageHistory(userId: string): Promise<void> {
    try {
      await prisma.contentUsage.deleteMany({
        where: {
          userId,
          contentType: this.contentType,
        },
      });
    } catch (error) {
      console.error('ExclusionTracker: Failed to clear usage history:', error);
      throw error;
    }
  }
}
