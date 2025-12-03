import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
};

/**
 * Page container that centers content with consistent padding
 * Used as the main wrapper for page content
 *
 * @example
 * <PageContainer maxWidth="xl">
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 */
export function PageContainer({
  children,
  maxWidth = 'xl',
  className = ''
}: PageContainerProps) {
  return (
    <div className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}
