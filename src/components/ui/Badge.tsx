import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'outline';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  success: 'bg-neutral-100 text-black border-neutral-300 font-medium',
  destructive: 'bg-black text-white border-black font-semibold',
  warning: 'bg-neutral-200 text-black border-neutral-300 font-medium',
  outline: 'bg-transparent border-neutral-300 text-black',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs rounded-md border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
