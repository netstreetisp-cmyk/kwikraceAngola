import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'high';
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white',
    glass: 'glass',
    high: 'bg-surface-container-low shadow-sm',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-6 border border-gray-100',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
