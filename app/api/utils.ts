/**
 * API Utilities
 *
 * Shared utilities for API route handlers including:
 * - Authentication checking
 * - Request validation
 * - Error handling
 * - Response formatting
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Check if user is authenticated and return session
 * Returns null and sends 401 response if not authenticated
 *
 * Usage:
 * ```typescript
 * const { session, response } = await requireAuth();
 * if (!session) return response;
 * // Continue with authenticated logic using session.user.id
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json(
        { error: 'Unauthorized - Please sign in to continue' },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}

/**
 * Validate that request body has all required fields
 *
 * @param body - Request body object
 * @param fields - Array of required field names
 * @returns Validation result with error message if invalid
 *
 * Usage:
 * ```typescript
 * const validation = validateRequiredFields(body, ['count', 'difficulty']);
 * if (!validation.valid) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 * ```
 */
export function validateRequiredFields(body: any, fields: string[]) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate that a value is within a specified range
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field (for error message)
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns Validation result
 */
export function validateRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
) {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate that a value is one of the allowed enum values
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field (for error message)
 * @param allowedValues - Array of allowed values
 * @returns Validation result
 */
export function validateEnum(
  value: any,
  fieldName: string,
  allowedValues: string[]
) {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Handle API errors consistently
 *
 * Logs error server-side and returns appropriate response to client.
 * Does not expose internal error details for security.
 *
 * @param error - Error object
 * @param defaultMessage - User-friendly error message
 * @returns NextResponse with error
 */
export function handleApiError(
  error: any,
  defaultMessage: string = 'Internal server error'
) {
  console.error('API Error:', error);

  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', error.stack);
  }

  return NextResponse.json(
    {
      error: defaultMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
      }),
    },
    { status: 500 }
  );
}

/**
 * Create a success response with consistent formatting
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Create an error response with consistent formatting
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}
