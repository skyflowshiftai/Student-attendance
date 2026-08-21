import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  className?: string;
}

export function DatePicker({ label, value, onChange, max, min, className }: DatePickerProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          max={max}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-10 pl-3 pr-10 text-sm font-medium rounded-lg border border-border',
            'bg-background text-foreground cursor-pointer',
            'transition-default focus-ring',
            'hover:border-muted-foreground/30'
          )}
        />
        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
