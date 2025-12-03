'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavBarProps {
  user?: {
    name: string;
    username: string;
  } | null;
}

/**
 * Navigation bar with glassmorphism styling
 * Responsive with hamburger menu on mobile
 *
 * @example
 * <NavBar user={{ name: "John Doe", username: "johndoe" }} />
 */
export function NavBar({ user }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Training', href: '/training' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Axon Overclocking</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-white/60">@{user.username}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-lg animate-[slideInUp_0.2s_ease-out]">
          <div className="px-4 py-4 space-y-2">
            {user && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-white/20 my-2 pt-2">
                  <div className="px-4 py-2 text-sm text-white/60">
                    Signed in as <span className="text-white font-medium">{user.username}</span>
                  </div>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
