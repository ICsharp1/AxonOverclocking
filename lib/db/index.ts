/**
 * Axon Overclocking - Database Client Configuration
 *
 * This module provides a singleton Prisma Client instance following Next.js
 * best practices to prevent multiple instances during development hot reloads.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const users = await db.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma Client instance
 *
 * In development, this prevents multiple instances from being created
 * during Next.js hot reloads. In production, creates a single instance.
 */
export const db = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

/**
 * Disconnect from database (useful in scripts and tests)
 */
export async function disconnect() {
  await db.$disconnect();
}

/**
 * Connect to database (useful in scripts and tests)
 */
export async function connect() {
  await db.$connect();
}
