/**
 * Authentication Session Utilities
 *
 * Provides type-safe session management helpers for server components.
 * These utilities simplify authentication checks and user data access.
 *
 * Usage in server components:
 *
 * import { getSession, requireAuth } from "@/lib/auth/session";
 *
 * // Get session (can be null)
 * const session = await getSession();
 * if (session) {
 *   console.log(session.user.id);
 * }
 *
 * // Require auth (redirects if not authenticated)
 * const session = await requireAuth();
 * console.log(session.user.id); // Always defined
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

/**
 * Extended session type that includes user ID
 */
export type AuthSession = Session | null;

/**
 * User type from session
 */
export type SessionUser = NonNullable<AuthSession>["user"];

/**
 * Get the current session
 * Returns null if user is not authenticated
 *
 * @returns Promise<Session | null>
 */
export async function getSession() {
  return await auth();
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in server components that require authentication
 *
 * @param callbackUrl - URL to redirect to after login (defaults to current page)
 * @returns Promise<Session> - Always returns a valid session or redirects
 */
export async function requireAuth(callbackUrl?: string) {
  const session = await auth();

  if (!session || !session.user) {
    // Redirect to login with callback URL
    const loginUrl = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(loginUrl);
  }

  return session;
}

/**
 * Get the current user's ID
 * Returns null if user is not authenticated
 *
 * @returns Promise<string | null>
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Check if user is authenticated
 * Returns boolean indicating authentication status
 *
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
