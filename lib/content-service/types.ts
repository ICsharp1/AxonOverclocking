/**
 * Content Service Type Definitions
 *
 * This file defines all types used by the content service system.
 * The content service manages reusable content (words, images, audio) for training modules
 * with intelligent exclusion to prevent showing the same content in consecutive sessions.
 */

/**
 * Word object representing a single word in the database
 */
export interface Word {
  word: string;
  category: string;
  length: number;
}

/**
 * Content types supported by the system
 */
export enum ContentType {
  WORD = 'word',
  IMAGE = 'image',
  AUDIO = 'audio',
}

/**
 * Difficulty levels for content selection
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Options for fetching words
 */
export interface GetWordsOptions {
  /**
   * Number of words to retrieve
   */
  count: number;

  /**
   * Difficulty level: 'easy', 'medium', or 'hard'
   * Maps to: common.json, uncommon.json, rare.json
   */
  difficulty: DifficultyLevel;

  /**
   * User ID for exclusion tracking
   * Used to query recent content usage and avoid repetition
   */
  userId: string;

  /**
   * Optional: Filter by categories (e.g., ['food', 'animals'])
   * If provided, only words from these categories will be returned
   */
  categories?: string[];

  /**
   * Optional: Minimum word length filter
   */
  minLength?: number;

  /**
   * Optional: Maximum word length filter
   */
  maxLength?: number;
}

/**
 * Content usage record for tracking
 * Mirrors the ContentUsage Prisma model
 */
export interface ContentUsageRecord {
  id: string;
  userId: string;
  contentType: string;
  items: Word[] | any[]; // JSON field containing array of content items
  usedAt: Date;
}

/**
 * Result of word selection with metadata
 */
export interface WordSelectionResult {
  /**
   * Selected words
   */
  words: Word[];

  /**
   * Metadata about the selection
   */
  metadata: {
    /**
     * Number of words requested
     */
    requested: number;

    /**
     * Number of words returned
     */
    returned: number;

    /**
     * Number of words excluded from recent sessions
     */
    excluded: number;

    /**
     * Total words available at this difficulty
     */
    totalAvailable: number;

    /**
     * Whether filters were relaxed to meet the count
     */
    filtersRelaxed: boolean;
  };
}

/**
 * Generic content service interface for extensibility
 * Future content types (images, audio) can implement this interface
 */
export interface IContentService<T> {
  /**
   * Get content items with exclusion tracking
   */
  getContent(options: any): Promise<T[]>;

  /**
   * Track content usage for a session
   */
  trackUsage(userId: string, items: T[]): Promise<void>;
}

/**
 * Exclusion tracker configuration
 */
export interface ExclusionTrackerConfig {
  /**
   * Number of recent sessions to exclude content from
   * Default: 3
   */
  sessionCount?: number;

  /**
   * Content type to track
   */
  contentType: ContentType;
}
