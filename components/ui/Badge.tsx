import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  default: 'bg-purple-500/80 text-white',
  success: 'bg-green-500/80 text-white',
  warning: 'bg-yellow-500/80 text-white',
  error: 'bg-red-500/80 text-white',
  info: 'bg-blue-500/80 text-white'
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
};

/**
 * Badge component for labels, categories, and status indicators
 *
 * @example
 * <Badge variant="success" size="md">Correct</Badge>
 * <Badge variant="error">Incorrect</Badge>
 * <Badge variant="warning">Missed</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full backdrop-blur-sm shadow-sm';

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
