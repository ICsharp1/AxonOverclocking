/**
 * Client-side Providers
 *
 * Wraps the application with NextAuth SessionProvider for client-side session access.
 * This allows useSession() hook to work in client components.
 */

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
