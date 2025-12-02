/**
 * Content Service - Main Export
 *
 * This file provides the public API for the content service system.
 * It exports a singleton instance of WordService that can be used throughout the application.
 *
 * Usage:
 *
 * ```typescript
 * import { contentService } from '@/lib/content-service';
 *
 * const words = await contentService.getWords({
 *   count: 20,
 *   difficulty: 'medium',
 *   userId: session.user.id,
 *   categories: ['food', 'animals']
 * });
 * ```
 */

import { WordService } from './WordService';
import { ExclusionTracker } from './ExclusionTracker';

// Export all types for use in other modules
export * from './types';

// Export classes for advanced usage or testing
export { WordService } from './WordService';
export { ExclusionTracker } from './ExclusionTracker';

/**
 * Singleton instance of WordService
 *
 * This is the primary way to interact with the content service.
 * The singleton pattern ensures:
 * - Shared cache across the application
 * - Consistent exclusion tracking
 * - Reduced memory footprint
 */
export const contentService = new WordService();

/**
 * Default export for convenience
 */
export default contentService;
