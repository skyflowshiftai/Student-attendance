import React from 'react';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

interface SystemStatusProps {
  mode?: 'demo' | 'live';
}

export function SystemStatus({ mode = 'live' }: SystemStatusProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-black border border-neutral-200 shadow-2xs">
      <span className="h-2 w-2 rounded-full bg-black"></span>
      Live Telephony Active
    </div>
  );
}
