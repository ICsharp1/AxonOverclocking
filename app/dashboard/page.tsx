/**
 * Dashboard Page (Protected Route)
 *
 * Main dashboard for authenticated users.
 * This is a temporary implementation for testing authentication.
 * Will be replaced with the full dashboard in Phase 6.
 */

import { requireAuth } from "@/lib/auth/session";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  // Require authentication - will redirect to login if not authenticated
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome, {session.user.username}!
              </h1>
              <p className="text-white/80">
                You are successfully logged in to Axon Overclocking.
              </p>
            </div>

            {/* Sign Out Button */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors duration-200 border border-white/30"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Profile
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">User ID:</span>
              <span className="text-white font-mono text-sm">
                {session.user.id}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Username:</span>
              <span className="text-white font-semibold">
                {session.user.username}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/70">Email:</span>
              <span className="text-white">{session.user.email}</span>
            </div>
            {session.user.name && (
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Name:</span>
                <span className="text-white">{session.user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-purple-500/20 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-purple-400/30">
          <p className="text-white/90 text-center">
            <span className="font-semibold">Dashboard features coming soon!</span>
            <br />
            <span className="text-sm text-white/70">
              Training modules, progress tracking, and more will be available in Phase 6.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
