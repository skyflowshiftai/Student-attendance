import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level?: RiskLevel | string;
  className?: string;
}

const config: Record<string, { label: string; classes: string }> = {
  low: {
    label: 'Low Risk',
    classes: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  },
  medium: {
    label: 'Moderate',
    classes: 'bg-neutral-200 text-black border-neutral-300',
  },
  high: {
    label: 'High Risk',
    classes: 'bg-black text-white border-black font-bold',
  },
};

const defaultRisk = {
  label: 'Normal',
  classes: 'bg-neutral-100 text-neutral-700 border-neutral-200',
};

export function RiskBadge({ level = 'low', className }: RiskBadgeProps) {
  const current = (level && config[level]) ? config[level]! : defaultRisk;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border',
      current.classes,
      className
    )}>
      {current.label}
    </span>
  );
}
