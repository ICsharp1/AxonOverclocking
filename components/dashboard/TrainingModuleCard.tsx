'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getDifficultyVariant, formatRelativeTime, formatScore } from './utils';

interface TrainingModuleCardProps {
  module: {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
  };
  progress?: {
    bestScore: number;
    totalSessions: number;
    averageScore: number;
    lastPlayed: Date | string | null;
  } | null;
}

/**
 * Training module card component
 * Displays module information and user progress
 * Clickable to navigate to the training page
 */
export function TrainingModuleCard({ module, progress }: TrainingModuleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/training/${module.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    router.push(`/training/${module.id}`);
  };

  return (
    <Card
      hover={true}
      className="cursor-pointer flex flex-col h-full"
      onClick={handleClick}
    >
      {/* Header with title and difficulty badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white pr-2">{module.name}</h3>
        <Badge variant={getDifficultyVariant(module.difficulty)} size="sm">
          {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-white/80 text-sm mb-4 flex-grow">{module.description}</p>

      {/* Estimated time */}
      <div className="flex items-center gap-2 mb-4 text-white/70 text-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{module.estimatedTime} minute{module.estimatedTime !== 1 ? 's' : ''}</span>
      </div>

      {/* Progress section (if user has completed sessions) */}
      {progress && progress.totalSessions > 0 ? (
        <div className="mb-4 space-y-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Best Score</span>
            <span className="font-bold text-white">
              {formatScore(progress.bestScore)}
            </span>
          </div>

          <ProgressBar
            value={progress.averageScore}
            max={100}
            variant="success"
            animated={false}
          />

          <div className="flex justify-between text-xs text-white/60">
            <span>{progress.totalSessions} session{progress.totalSessions !== 1 ? 's' : ''}</span>
            <span>Avg: {formatScore(progress.averageScore)}</span>
          </div>

          {progress.lastPlayed && (
            <div className="text-xs text-white/50 text-center pt-2 border-t border-white/10">
              Last played {formatRelativeTime(progress.lastPlayed)}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-400/20">
          <p className="text-sm text-white/70 text-center">
            <span className="font-semibold text-white">New Challenge</span>
            <br />
            Complete your first session to start tracking progress
          </p>
        </div>
      )}

      {/* Action button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleButtonClick}
      >
        {progress && progress.totalSessions > 0 ? 'Continue Training' : 'Start Training'}
      </Button>
    </Card>
  );
}
