'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:from-purple-600 hover:to-indigo-700 active:from-purple-700 active:to-indigo-800',
  secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:bg-white/30',
  success: 'bg-green-500 text-white shadow-lg hover:bg-green-600 active:bg-green-700',
  danger: 'bg-red-500 text-white shadow-lg hover:bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent text-white hover:bg-white/10 active:bg-white/20'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg'
};

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-xl font-medium transition-all duration-200 ease-in-out focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none';
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:scale-105 active:scale-95 cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
