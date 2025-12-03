'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  variant?: 'default' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  autoStart?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl'
};

const variantClasses = {
  default: 'text-white',
  warning: 'text-yellow-400',
  danger: 'text-red-400'
};

/**
 * Countdown timer component that changes color based on time remaining
 *
 * @example
 * <Timer seconds={60} onComplete={() => console.log('Time up!')} />
 */
export function Timer({
  seconds,
  onComplete,
  variant = 'default',
  size = 'md',
  autoStart = true,
  className = ''
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  // Determine color based on time remaining
  const getColorClass = () => {
    if (variant !== 'default') return variantClasses[variant];

    const percentage = (timeLeft / seconds) * 100;
    if (percentage <= 20) return 'text-red-400';
    if (percentage <= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${getColorClass()} font-bold font-mono transition-colors duration-300`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(timeLeft)}
      </div>

      {/* Progress ring */}
      <div className="relative w-16 h-16">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={2 * Math.PI * 28}
            strokeDashoffset={2 * Math.PI * 28 * (1 - timeLeft / seconds)}
            className={`${getColorClass()} transition-all duration-1000 ease-linear`}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
