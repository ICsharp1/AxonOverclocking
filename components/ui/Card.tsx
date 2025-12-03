'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
};

/**
 * Glass-morphism card component with semi-transparent background and backdrop blur
 *
 * @example
 * <Card blur="md" hover={true}>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 */
export function Card({
  children,
  className = '',
  blur = 'md',
  hover = true,
  onClick
}: CardProps) {
  const baseClasses = 'rounded-2xl bg-white/10 border border-white/20 shadow-xl p-6';
  const hoverClasses = hover ? 'transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${blurClasses[blur]} ${hoverClasses} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
