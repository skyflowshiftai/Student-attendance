import React from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ title, message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-black">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-black mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 text-center max-w-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
