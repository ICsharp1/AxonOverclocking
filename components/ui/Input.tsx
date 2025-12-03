'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input component with glassmorphism styling
 *
 * @example
 * <Input
 *   label="Username"
 *   placeholder="Enter username"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   error="Username is required"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', disabled = false, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border text-white placeholder-white/50 transition-all duration-200 ease-in-out focus:outline-none';
    const borderClasses = error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/50'
      : 'border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50';
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-white/15';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`${baseClasses} ${borderClasses} ${disabledClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-white/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
