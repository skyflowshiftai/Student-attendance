import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-black text-white hover:bg-neutral-800 shadow-xs cursor-pointer',
  secondary: 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200 cursor-pointer',
  ghost: 'hover:bg-neutral-100 text-black cursor-pointer',
  destructive: 'bg-black text-white hover:bg-neutral-800 cursor-pointer',
  outline: 'border border-neutral-300 bg-white text-black hover:bg-neutral-100 cursor-pointer',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg font-medium',
  md: 'h-10 px-4 text-sm rounded-lg font-medium',
  lg: 'h-12 px-6 text-base rounded-lg font-medium',
};

export function Button({ variant = 'primary', size = 'md', loading, className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all focus-ring',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
