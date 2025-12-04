/**
 * WordService Class
 *
 * Main service for word selection and management. This class handles:
 * - Loading words from JSON files
 * - Filtering by difficulty, category, and length
 * - Excluding recently used words (via ExclusionTracker)
 * - Random selection of words
 * - Tracking usage for future exclusion
 * - Graceful degradation when insufficient words are available
 *
 * The service uses an in-memory cache for loaded word files to optimize performance.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ExclusionTracker } from './ExclusionTracker';
import {
  Word,
  GetWordsOptions,
  DifficultyLevel,
  ContentType,
  WordSelectionResult,
  IContentService,
} from './types';

export class WordService implements IContentService<Word> {
  private exclusionTracker: ExclusionTracker;
  private wordCache: Map<DifficultyLevel, Word[]>;
  private dataPath: string;

  constructor() {
    this.exclusionTracker = new ExclusionTracker({
      contentType: ContentType.WORD,
      sessionCount: 3,
    });

    this.wordCache = new Map();

    // Set path to word data files
    // In development: data/words/
    this.dataPath = path.join(process.cwd(), 'data', 'words');
  }

  /**
   * Get words based on the provided options
   *
   * This is the main public API for word selection. It:
   * 1. Loads words from JSON files (with caching)
   * 2. Filters by difficulty, category, and length
   * 3. Excludes recently used words
   * 4. Randomly selects the requested count
   * 5. Tracks usage for future exclusion
   *
   * @param options - Word selection options
   * @returns Promise resolving to array of selected words
   */
  async getWords(options: GetWordsOptions): Promise<Word[]> {
    const result = await this.getWordsWithMetadata(options);
    return result.words;
  }

  /**
   * Get words with detailed metadata about the selection
   *
   * Same as getWords but returns additional metadata useful for debugging
   * and monitoring the selection process.
   *
   * @param options - Word selection options
   * @returns Promise resolving to selection result with metadata
   */
  async getWordsWithMetadata(options: GetWordsOptions): Promise<WordSelectionResult> {
    const { count, difficulty, userId, categories, minLength, maxLength } = options;

    // Validate options
    this.validateOptions(options);

    // Load words for the specified difficulty
    const allWords = await this.loadWords(difficulty);
    const totalAvailable = allWords.length;

    // Get excluded words from recent sessions
    const excludedWords = await this.exclusionTracker.getRecentlyUsedWords(userId);

    // Filter words based on all criteria
    let filteredWords = this.filterWords(allWords, {
      categories,
      minLength,
      maxLength,
      excludedWords,
    });

    let filtersRelaxed = false;

    // Handle insufficient words scenario
    if (filteredWords.length < count) {
      console.warn(
        `WordService: Insufficient words after filtering. ` +
          `Requested: ${count}, Available: ${filteredWords.length}. ` +
          `Attempting to relax filters...`
      );

      // Try relaxing filters progressively
      filteredWords = this.relaxFiltersAndRetry(allWords, {
        categories,
        minLength,
        maxLength,
        excludedWords,
        targetCount: count,
      });

      filtersRelaxed = true;
    }

    // Select random words
    const selectedWords = this.selectRandomWords(filteredWords, count);

    // Track usage (async, don't wait)
    this.exclusionTracker.trackUsage(userId, selectedWords).catch((error) => {
      console.error('WordService: Failed to track word usage:', error);
    });

    return {
      words: selectedWords,
      metadata: {
        requested: count,
        returned: selectedWords.length,
        excluded: excludedWords.size,
        totalAvailable,
        filtersRelaxed,
      },
    };
  }

  /**
   * Generic content retrieval method (implements IContentService interface)
   */
  async getContent(options: GetWordsOptions): Promise<Word[]> {
    return this.getWords(options);
  }

  /**
   * Track usage for content items
   */
  async trackUsage(userId: string, items: Word[]): Promise<void> {
    return this.exclusionTracker.trackUsage(userId, items);
  }

  /**
   * Load words from JSON file for a specific difficulty level
   *
   * Uses in-memory cache to avoid repeated file I/O.
   * Difficulty mapping:
   * - 'easy' -> common.json
   * - 'medium' -> uncommon.json
   * - 'hard' -> rare.json
   *
   * @param difficulty - Difficulty level
   * @returns Array of words
   */
  private async loadWords(difficulty: DifficultyLevel): Promise<Word[]> {
    // Check cache first
    if (this.wordCache.has(difficulty)) {
      return this.wordCache.get(difficulty)!;
    }

    // Map difficulty to filename
    const fileMap: Record<DifficultyLevel, string> = {
      easy: 'common.json',
      normal: 'normal.json',
      medium: 'uncommon.json',
      hard: 'rare.json',
    };

    const filename = fileMap[difficulty];
    const filePath = path.join(this.dataPath, filename);

    try {
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const words: Word[] = JSON.parse(fileContent);

      // Validate word structure
      this.validateWords(words, difficulty);

      // Cache the words
      this.wordCache.set(difficulty, words);

      return words;
    } catch (error) {
      console.error(`WordService: Failed to load words from ${filePath}:`, error);
      throw new Error(`Failed to load ${difficulty} words: ${error}`);
    }
  }

  /**
   * Filter words based on criteria
   *
   * @param words - Array of words to filter
   * @param filters - Filter criteria
   * @returns Filtered array of words
   */
  private filterWords(
    words: Word[],
    filters: {
      categories?: string[];
      minLength?: number;
      maxLength?: number;
      excludedWords: Set<string>;
    }
  ): Word[] {
    const { categories, minLength, maxLength, excludedWords } = filters;

    return words.filter((word) => {
      // Filter by category
      if (categories && categories.length > 0) {
        if (!categories.includes(word.category)) {
          return false;
        }
      }

      // Filter by minimum length
      if (minLength !== undefined && word.length < minLength) {
        return false;
      }

      // Filter by maximum length
      if (maxLength !== undefined && word.length > maxLength) {
        return false;
      }

      // Filter by exclusion (most important!)
      if (excludedWords.has(word.word)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Progressively relax filters to get more words when insufficient
   *
   * Priority order:
   * 1. Relax length constraints
   * 2. Relax category constraints
   * 3. Allow some excluded words (oldest first)
   *
   * @param allWords - All available words
   * @param filters - Current filters
   * @returns Filtered array with relaxed constraints
   */
  private relaxFiltersAndRetry(
    allWords: Word[],
    filters: {
      categories?: string[];
      minLength?: number;
      maxLength?: number;
      excludedWords: Set<string>;
      targetCount: number;
    }
  ): Word[] {
    const { categories, excludedWords, targetCount } = filters;

    // Try 1: Relax length constraints
    let filtered = this.filterWords(allWords, {
      categories,
      excludedWords,
    });

    if (filtered.length >= targetCount) {
      console.log('WordService: Relaxed length constraints');
      return filtered;
    }

    // Try 2: Relax category constraints
    filtered = this.filterWords(allWords, {
      excludedWords,
    });

    if (filtered.length >= targetCount) {
      console.log('WordService: Relaxed category constraints');
      return filtered;
    }

    // Try 3: Allow all words (ignore exclusions)
    // This is last resort - better to show repeated words than fail
    filtered = this.filterWords(allWords, {
      categories,
      excludedWords: new Set<string>(),
    });

    if (filtered.length >= targetCount) {
      console.warn('WordService: Allowing excluded words due to insufficient unique words');
      return filtered;
    }

    // Try 4: Absolutely everything
    console.warn('WordService: Using all available words - insufficient unique content');
    return allWords;
  }

  /**
   * Randomly select N words from the filtered set
   *
   * Uses Fisher-Yates shuffle algorithm for unbiased random selection.
   *
   * @param words - Array of words to select from
   * @param count - Number of words to select
   * @returns Array of randomly selected words
   */
  private selectRandomWords(words: Word[], count: number): Word[] {
    if (words.length <= count) {
      return [...words]; // Return all if insufficient
    }

    // Fisher-Yates shuffle (partial)
    const shuffled = [...words];
    for (let i = 0; i < count; i++) {
      const randomIndex = i + Math.floor(Math.random() * (shuffled.length - i));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  /**
   * Validate word selection options
   *
   * @param options - Options to validate
   * @throws Error if options are invalid
   */
  private validateOptions(options: GetWordsOptions): void {
    const { count, difficulty, userId } = options;

    if (count <= 0) {
      throw new Error('Word count must be greater than 0');
    }

    if (!['easy', 'normal', 'medium', 'hard'].includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}. Must be 'easy', 'normal', 'medium', or 'hard'`);
    }

    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required for word selection');
    }

    if (options.minLength !== undefined && options.minLength < 0) {
      throw new Error('Minimum length cannot be negative');
    }

    if (options.maxLength !== undefined && options.maxLength < 0) {
      throw new Error('Maximum length cannot be negative');
    }

    if (
      options.minLength !== undefined &&
      options.maxLength !== undefined &&
      options.minLength > options.maxLength
    ) {
      throw new Error('Minimum length cannot be greater than maximum length');
    }
  }

  /**
   * Validate word structure from loaded JSON
   *
   * @param words - Words to validate
   * @param difficulty - Difficulty level (for error messages)
   * @throws Error if words are invalid
   */
  private validateWords(words: Word[], difficulty: string): void {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error(`Invalid word file for ${difficulty}: must be non-empty array`);
    }

    // Validate first few words to ensure structure is correct
    for (let i = 0; i < Math.min(5, words.length); i++) {
      const word = words[i];
      if (!word.word || typeof word.word !== 'string') {
        throw new Error(`Invalid word structure at index ${i}: missing or invalid 'word' field`);
      }
      if (!word.category || typeof word.category !== 'string') {
        throw new Error(
          `Invalid word structure at index ${i}: missing or invalid 'category' field`
        );
      }
      if (typeof word.length !== 'number' || word.length <= 0) {
        throw new Error(`Invalid word structure at index ${i}: missing or invalid 'length' field`);
      }
    }
  }

  /**
   * Clear the word cache
   *
   * Useful for testing or when word files are updated at runtime.
   */
  clearCache(): void {
    this.wordCache.clear();
  }

  /**
   * Get exclusion statistics for a user
   *
   * @param userId - User ID
   * @returns Exclusion statistics
   */
  async getExclusionStats(userId: string) {
    return this.exclusionTracker.getExclusionStats(userId);
  }
}
