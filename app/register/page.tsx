/**
 * Registration Page
 *
 * Allows new users to create an account with username, email, and password.
 * Validates input client-side and server-side.
 * Auto-logs in user after successful registration.
 *
 * Features:
 * - Username, email, password, confirm password fields
 * - Client-side validation (passwords match, format checks)
 * - Server-side validation and duplicate checking
 * - Auto-login after successful registration
 * - Error and success message display
 * - Link to login page
 */

"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Input } from '@/components/ui';
import { AnimatedBackground, PageContainer } from '@/components/layout';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation
  const validateForm = (): string | null => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return "All fields are required.";
    }

    if (formData.username.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      return "Username can only contain letters, numbers, underscores, and dashes.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Call registration API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Registration successful - auto-login
      const signInResult = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but login failed - redirect to login page
        router.push("/login?message=Registration successful. Please log in.");
      } else {
        // Both registration and login succeeded - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Registration Container */}
      <PageContainer maxWidth="sm" className="flex items-center justify-center py-12">
        <div className="w-full max-w-md animate-[scaleIn_0.5s_ease-out]">
          {/* App Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-white hover:text-white/90 transition-colors text-shadow-md">
                Axon Overclocking
              </h1>
            </Link>
          </div>

          {/* Registration Card */}
          <Card blur="lg" hover={false} className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-white/80">
                Start your brain training journey today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl">
                <p className="text-red-200 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <Input
                id="username"
                type="text"
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Choose a username"
                helperText="3-20 characters, letters, numbers, _ or -"
                required
                disabled={isLoading}
              />

              {/* Email Field */}
              <Input
                id="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />

              {/* Password Field */}
              <Input
                id="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create a password"
                helperText="Minimum 6 characters"
                required
                disabled={isLoading}
              />

              {/* Confirm Password Field */}
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full mt-6"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 backdrop-blur-sm rounded-full text-white/70">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="secondary"
              size="lg"
              className="w-full bg-white/20 hover:bg-white/30"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>

            {/* Login Link */}
            <p className="mt-6 text-center text-white/80 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-300 hover:text-purple-200 font-semibold underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </Card>

          {/* Back to Home Link */}
          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/60 hover:text-white/90 text-sm transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
