/**
 * NextAuth v5 Configuration
 *
 * This file configures authentication for the brain training application with:
 * - Credentials provider (username/password)
 * - Google OAuth provider (optional)
 * - JWT strategy for stateless sessions
 * - Session extension to include user database ID
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any, // Type assertion for adapter compatibility

  // Use JWT strategy instead of database sessions for better performance
  session: {
    strategy: "jwt",
  },

  // Authentication pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    // Credentials provider for username/password authentication
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        // Find user by username
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object (will be passed to JWT callback)
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth provider (optional - configure when ready)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Allow users to sign in with existing Google accounts
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    /**
     * JWT Callback - Extends JWT token with user database ID
     * This runs whenever a JWT is created or updated
     */
    async jwt({ token, user, account }) {
      // On sign-in, add user ID to token
      if (user) {
        token.id = user.id as string;
        token.username = (user as any).username;
      }

      // For OAuth sign-ins, link to existing user or create new one
      if (account?.provider === "google") {
        // The adapter handles account linking automatically
        // Just ensure the user ID is in the token
        if (user) {
          token.id = user.id as string;
        }
      }

      return token;
    },

    /**
     * Session Callback - Extends session object with user data from JWT
     * This runs whenever session is accessed (getSession, useSession)
     */
    async session({ session, token }) {
      // Add user ID and username to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }

      return session;
    },

    /**
     * SignIn Callback - Controls whether user can sign in
     * Runs on successful sign-in attempt
     */
    async signIn({ user, account, profile }) {
      // For OAuth, ensure user has email
      if (account?.provider === "google") {
        if (!profile?.email) {
          return false;
        }

        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        // If user exists, allow linking
        if (existingUser) {
          return true;
        }

        // For new OAuth users, create username from email
        // This will be handled by the adapter, but we validate here
        return true;
      }

      return true;
    },
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
});
