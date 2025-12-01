/**
 * TypeScript type definitions for Prisma JSON fields
 *
 * These types provide type safety and documentation for the extensibility
 * pattern used in TrainingModule, TrainingSession, and UserProgress models.
 *
 * The JSON fields allow adding new training types without database migrations
 * while maintaining type safety at the application layer.
 */

// ============================================================================
// TRAINING MODULE CONFIGURATION
// ============================================================================

/**
 * Difficulty level settings for a training module
 */
export interface DifficultyLevel {
  wordCount: number;
  categories: string[];
  minLength?: number;
  maxLength?: number;
  timeLimit?: number;
  [key: string]: any; // Allow module-specific properties
}

/**
 * Scoring thresholds for performance levels
 */
export interface ScoringConfig {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

/**
 * Word Memory Training Module Configuration
 */
export interface WordMemoryConfig {
  studyTime: number; // seconds
  recallTime: number; // seconds
  difficulties: {
    easy: DifficultyLevel;
    medium: DifficultyLevel;
    hard: DifficultyLevel;
  };
  scoring: ScoringConfig;
}

/**
 * Base configuration type for all training modules
 * Extend this for new training types
 */
export interface BaseTrainingModuleConfig {
  difficulties: Record<string, DifficultyLevel>;
  scoring: ScoringConfig;
  [key: string]: any; // Allow module-specific properties
}

/**
 * Union type of all training module configurations
 * Add new training types here as they are implemented
 */
export type TrainingModuleConfiguration =
  | WordMemoryConfig
  | BaseTrainingModuleConfig;

// ============================================================================
// TRAINING SESSION CONFIGURATION & RESULTS
// ============================================================================

/**
 * Configuration snapshot for a specific training session
 * This captures the exact settings used for the session
 */
export interface SessionConfiguration {
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount?: number;
  studyTime?: number;
  recallTime?: number;
  [key: string]: any; // Allow module-specific properties
}

/**
 * Word Memory Training Session Results
 */
export interface WordMemoryResults {
  studiedWords: string[];
  recalledWords: string[];
  correctWords: string[];
  incorrectWords: string[];
  missedWords: string[];
}

/**
 * Base results type for all training sessions
 * Extend this for new training types
 */
export interface BaseSessionResults {
  [key: string]: any; // Allow module-specific results
}

/**
 * Union type of all session result types
 * Add new training types here as they are implemented
 */
export type SessionResults =
  | WordMemoryResults
  | BaseSessionResults;

// ============================================================================
// USER PROGRESS - ADAPTIVE DIFFICULTY
// ============================================================================

/**
 * Adaptive difficulty state for a user in a specific training module
 * This tracks the user's current level and readiness to progress
 */
export interface AdaptiveDifficulty {
  level: 'easy' | 'medium' | 'hard';
  adaptiveScore: number; // Moving average of recent performance
  readyForHard?: boolean;
  readyForMedium?: boolean;
  sessionsAtCurrentLevel?: number;
  lastLevelChange?: string; // ISO date string
  [key: string]: any; // Allow module-specific adaptive state
}

// ============================================================================
// CONTENT USAGE - EXCLUSION TRACKING
// ============================================================================

/**
 * Content items shown to a user in a specific session
 * Stored as JSON array in ContentUsage.items
 */
export type ContentItems = string[] | number[] | any[];

// ============================================================================
// HELPER TYPES FOR DATABASE OPERATIONS
// ============================================================================

/**
 * Type-safe wrapper for TrainingModule with typed configuration
 */
export interface TypedTrainingModule<T extends TrainingModuleConfiguration = TrainingModuleConfiguration> {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  configuration: T;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Type-safe wrapper for TrainingSession with typed configuration and results
 */
export interface TypedTrainingSession<
  TConfig extends SessionConfiguration = SessionConfiguration,
  TResults extends SessionResults = SessionResults
> {
  id: string;
  userId: string;
  trainingModuleId: string;
  configuration: TConfig;
  results: TResults;
  score: number;
  accuracy: number | null;
  duration: number;
  performanceLevel: string;
  status: string;
  createdAt: Date;
}

/**
 * Type-safe wrapper for UserProgress with typed difficulty
 */
export interface TypedUserProgress<T extends AdaptiveDifficulty = AdaptiveDifficulty> {
  id: string;
  userId: string;
  trainingModuleId: string;
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  currentDifficulty: T | null;
  lastSessionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard to check if configuration is WordMemoryConfig
 */
export function isWordMemoryConfig(config: any): config is WordMemoryConfig {
  return (
    typeof config === 'object' &&
    typeof config.studyTime === 'number' &&
    typeof config.recallTime === 'number' &&
    typeof config.difficulties === 'object' &&
    typeof config.scoring === 'object'
  );
}

/**
 * Type guard to check if results are WordMemoryResults
 */
export function isWordMemoryResults(results: any): results is WordMemoryResults {
  return (
    typeof results === 'object' &&
    Array.isArray(results.studiedWords) &&
    Array.isArray(results.recalledWords) &&
    Array.isArray(results.correctWords) &&
    Array.isArray(results.incorrectWords) &&
    Array.isArray(results.missedWords)
  );
}

/**
 * Type guard to check if difficulty is AdaptiveDifficulty
 */
export function isAdaptiveDifficulty(difficulty: any): difficulty is AdaptiveDifficulty {
  return (
    typeof difficulty === 'object' &&
    typeof difficulty.level === 'string' &&
    typeof difficulty.adaptiveScore === 'number' &&
    ['easy', 'medium', 'hard'].includes(difficulty.level)
  );
}
