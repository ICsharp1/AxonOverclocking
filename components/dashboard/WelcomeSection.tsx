import { Card } from '@/components/ui/Card';
import { formatDate } from './utils';

interface WelcomeSectionProps {
  user: {
    name: string;
    username: string;
  };
}

/**
 * Welcome section that greets the user with motivational message
 * Displays at the top of the dashboard
 */
export function WelcomeSection({ user }: WelcomeSectionProps) {
  const currentDate = formatDate(new Date());

  return (
    <Card className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user.name || user.username}!
          </h1>
          <p className="text-lg text-white/80 mb-1">
            Ready to push your cognitive limits today?
          </p>
          <p className="text-sm text-white/60">{currentDate}</p>
        </div>

        {/* Optional: Add a motivational icon/graphic */}
        <div className="hidden lg:block">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}
