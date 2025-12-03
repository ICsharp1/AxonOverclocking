'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const variantClasses = {
  default: 'bg-gradient-to-r from-purple-500 to-indigo-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500'
};

/**
 * Progress bar component for displaying progress, scores, or time remaining
 *
 * @example
 * <ProgressBar value={75} max={100} variant="success" showLabel={true} />
 */
export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  animated = false,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const animatedClass = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-sm font-medium text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full ${variantClasses[variant]} ${animatedClass} shadow-lg`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
