import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#9d1c2b] text-white shadow-lg shadow-red-100 hover:brightness-110',
      secondary: 'bg-[#f4a7bb] text-white hover:bg-[#f195ae]',
      outline: 'bg-transparent border border-gray-200 text-[#1a1a1a] hover:bg-gray-50',
      ghost: 'bg-transparent text-[#1a1a1a] hover:bg-gray-50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-headline font-bold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
