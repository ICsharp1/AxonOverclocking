/**
 * Content Words API Route
 *
 * POST /api/content/words
 *
 * Fetches words for training sessions using the content service with intelligent
 * exclusion tracking to prevent showing the same words in consecutive sessions.
 *
 * Features:
 * - Authentication required
 * - Comprehensive request validation
 * - Integration with WordService for smart word selection
 * - Exclusion tracking (avoids last 3 sessions)
 * - Support for filtering by category, length constraints
 * - Returns metadata about selection process
 *
 * Performance target: < 500ms response time
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/content-service';
import {
  requireAuth,
  validateRequiredFields,
  validateRange,
  validateEnum,
  handleApiError,
  successResponse,
  errorResponse,
} from '@/app/api/utils';

/**
 * Request body type definition
 */
interface WordsRequestBody {
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categories?: string[];
  minLength?: number;
  maxLength?: number;
}

/**
 * POST handler - Fetch words with exclusion tracking
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const { session, response } = await requireAuth();
    if (!session) return response;

    // 2. Parse request body
    let body: WordsRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON in request body');
    }

    // 3. Validate required fields
    const requiredValidation = validateRequiredFields(body, ['count', 'difficulty']);
    if (!requiredValidation.valid) {
      return errorResponse(requiredValidation.error!);
    }

    // 4. Validate count range (1-50 words max)
    const countValidation = validateRange(body.count, 'count', 1, 50);
    if (!countValidation.valid) {
      return errorResponse(countValidation.error!);
    }

    // 5. Validate difficulty enum
    const difficultyValidation = validateEnum(
      body.difficulty,
      'difficulty',
      ['easy', 'medium', 'hard']
    );
    if (!difficultyValidation.valid) {
      return errorResponse(difficultyValidation.error!);
    }

    // 6. Validate optional parameters
    if (body.minLength !== undefined) {
      const minLengthValidation = validateRange(body.minLength, 'minLength', 1, 20);
      if (!minLengthValidation.valid) {
        return errorResponse(minLengthValidation.error!);
      }
    }

    if (body.maxLength !== undefined) {
      const maxLengthValidation = validateRange(body.maxLength, 'maxLength', 1, 20);
      if (!maxLengthValidation.valid) {
        return errorResponse(maxLengthValidation.error!);
      }
    }

    // Validate min/max length relationship
    if (
      body.minLength !== undefined &&
      body.maxLength !== undefined &&
      body.minLength > body.maxLength
    ) {
      return errorResponse('minLength cannot be greater than maxLength');
    }

    // Validate categories if provided
    if (body.categories !== undefined) {
      if (!Array.isArray(body.categories)) {
        return errorResponse('categories must be an array');
      }
      if (body.categories.some((cat) => typeof cat !== 'string')) {
        return errorResponse('categories must be an array of strings');
      }
    }

    // 7. Fetch words using content service
    const result = await contentService.getWordsWithMetadata({
      count: body.count,
      difficulty: body.difficulty,
      userId: session.user.id,
      categories: body.categories,
      minLength: body.minLength,
      maxLength: body.maxLength,
    });

    // 8. Return success response with words and metadata
    return successResponse({
      words: result.words.map((word) => ({
        word: word.word,
        category: word.category,
        length: word.length,
      })),
      metadata: {
        count: result.words.length,
        requested: body.count,
        difficulty: body.difficulty,
        excludedCount: result.metadata.excluded,
        totalAvailable: result.metadata.totalAvailable,
        filtersRelaxed: result.metadata.filtersRelaxed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    // Handle content service errors
    if (error.message.includes('Failed to load')) {
      return handleApiError(error, 'Failed to load word database');
    }

    if (error.message.includes('Invalid difficulty')) {
      return errorResponse(error.message);
    }

    // Generic error handling
    return handleApiError(error, 'Failed to fetch words');
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
