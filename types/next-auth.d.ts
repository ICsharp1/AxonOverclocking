/**
 * NextAuth Type Extensions
 *
 * Extends NextAuth types to include custom user properties:
 * - id: User database ID
 * - username: User's unique username
 *
 * This ensures TypeScript recognizes these properties in session objects.
 */

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended Session type - includes user.id and user.username
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  /**
   * Extended User type - includes username
   */
  interface User extends DefaultUser {
    username: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type - includes id and username
   */
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
  }
}
