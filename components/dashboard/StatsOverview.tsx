import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from './utils';

interface StatsOverviewProps {
  stats: {
    totalSessions: number;
    currentStreak: number;
    totalScore: number;
    lastTraining: Date | string | null;
  };
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

/**
 * Individual stat card displaying a metric
 */
function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <Card className="p-4" hover={false}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        <span className="text-2xl" role="img" aria-label={label}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
    </Card>
  );
}

/**
 * Stats overview section displaying key metrics in a grid
 * Shows total sessions, current streak, total score, and last training time
 */
export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Your Progress</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          icon="📊"
          variant="info"
        />
        <StatCard
          label="Current Streak"
          value={stats.currentStreak === 0 ? '0 days' : `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
          icon="🔥"
          variant={stats.currentStreak > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="Total Points"
          value={Math.round(stats.totalScore)}
          icon="⭐"
          variant="warning"
        />
        <StatCard
          label="Last Training"
          value={formatRelativeTime(stats.lastTraining)}
          icon="🕐"
          variant="default"
        />
      </div>

      {/* Motivational message based on stats */}
      {stats.totalSessions === 0 && (
        <Card className="mt-4 p-4 bg-purple-500/20 border-purple-400/30">
          <p className="text-white/90 text-center">
            <span className="font-semibold">Start your cognitive journey today!</span>
            <br />
            <span className="text-sm text-white/70">
              Complete your first training session to begin tracking your progress.
            </span>
          </p>
        </Card>
      )}

      {stats.totalSessions > 0 && stats.currentStreak === 0 && (
        <Card className="mt-4 p-4 bg-yellow-500/20 border-yellow-400/30">
          <p className="text-white/90 text-center">
            <span className="font-semibold">Time to rebuild your streak!</span>
            <br />
            <span className="text-sm text-white/70">
              Train today to start a new streak and maintain consistency.
            </span>
          </p>
        </Card>
      )}

      {stats.currentStreak >= 7 && (
        <Card className="mt-4 p-4 bg-green-500/20 border-green-400/30">
          <p className="text-white/90 text-center">
            <span className="font-semibold">🎉 Impressive streak! Keep it going!</span>
            <br />
            <span className="text-sm text-white/70">
              You've trained for {stats.currentStreak} consecutive days. Your dedication is paying off!
            </span>
          </p>
        </Card>
      )}
    </div>
  );
}
