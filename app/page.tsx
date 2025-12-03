import Link from 'next/link';
import { auth } from '@/auth';
import { Card, Button } from '@/components/ui';
import { AnimatedBackground, PageContainer } from '@/components/layout';

/**
 * Landing Homepage
 *
 * Public-facing homepage showcasing the Axon Overclocking brain training app.
 * Features hero section, benefits, how it works, and call-to-action buttons.
 * Shows different CTAs based on authentication status.
 */
export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen relative">
      {/* Animated Background Blobs */}
      <AnimatedBackground />

      {/* Main Content */}
      <PageContainer maxWidth="2xl" className="py-12 md:py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24 animate-[fadeIn_0.6s_ease-out]">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white text-shadow-md">
            Axon Overclocking
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-white/90 font-medium">
            Rewire Your Brain Through Intensive Training
          </p>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            Harness the power of neuroplasticity with science-backed exercises designed to enhance memory,
            focus, and cognitive performance. Challenge yourself daily and unlock your brain&apos;s full potential.
          </p>

          {/* CTA Buttons - Different based on auth status */}
          {session ? (
            // Signed in - Show Dashboard button
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Go to Dashboard
                </Button>
              </Link>
              <p className="text-white/70 text-sm">
                Welcome back, {session.user?.name || 'Trainer'}! 👋
              </p>
            </div>
          ) : (
            // Not signed in - Show Get Started / Sign In
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Why Choose Axon Overclocking?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card
              className="text-center animate-[scaleIn_0.5s_ease-out_0.1s_backwards]"
              blur="lg"
              hover={true}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Adaptive Difficulty</h3>
              <p className="text-white/80">
                Exercises automatically adjust to your skill level, keeping you in the optimal challenge zone for maximum growth.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card
              className="text-center animate-[scaleIn_0.5s_ease-out_0.2s_backwards]"
              blur="lg"
              hover={true}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Science-Backed</h3>
              <p className="text-white/80">
                Every exercise is based on peer-reviewed neuroscience research and proven cognitive training methodologies.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card
              className="text-center animate-[scaleIn_0.5s_ease-out_0.3s_backwards]"
              blur="lg"
              hover={true}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Track Progress</h3>
              <p className="text-white/80">
                Monitor your improvement with detailed analytics, performance metrics, and streak tracking to stay motivated.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card
              className="text-center animate-[scaleIn_0.5s_ease-out_0.4s_backwards]"
              blur="lg"
              hover={true}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-fuchsia-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Daily Challenges</h3>
              <p className="text-white/80">
                Build consistency with daily training sessions designed to push your limits and develop lasting cognitive habits.
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center animate-[fadeIn_0.6s_ease-out_0.2s_backwards]">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Choose Your Training</h3>
              <p className="text-white/80 text-lg">
                Select from multiple cognitive exercises targeting memory, attention, processing speed, and more.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-[fadeIn_0.6s_ease-out_0.4s_backwards]">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Complete Sessions</h3>
              <p className="text-white/80 text-lg">
                Engage in focused training sessions that adapt to your performance in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-[fadeIn_0.6s_ease-out_0.6s_backwards]">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Track Growth</h3>
              <p className="text-white/80 text-lg">
                Watch your scores improve over time and celebrate milestones as your brain adapts and grows stronger.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center animate-[scaleIn_0.6s_ease-out_0.3s_backwards]">
          <Card className="max-w-3xl mx-auto p-12" blur="lg" hover={false}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Mind?
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Join thousands of users who are already experiencing the benefits of cognitive training.
              Start your journey today—it only takes a few minutes to begin.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg" className="min-w-[250px]">
                Start Training Now
              </Button>
            </Link>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center text-white/60">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-4">
            <Link href="/login" className="hover:text-white/90 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white/90 transition-colors">
              Create Account
            </Link>
            <span className="hidden md:inline">•</span>
            <span>© 2025 Axon Overclocking. All rights reserved.</span>
          </div>
          <p className="text-sm">
            Science-backed brain training for peak cognitive performance
          </p>
        </footer>
      </PageContainer>
    </div>
  );
}
