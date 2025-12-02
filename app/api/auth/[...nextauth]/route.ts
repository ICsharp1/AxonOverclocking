/**
 * NextAuth v5 API Route Handler
 *
 * This file exports the GET and POST handlers for all NextAuth endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/csrf
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
