import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ActivityEvent as ActivityEventType } from '@/types';

interface ActivityEventProps {
  event: ActivityEventType;
  isNew?: boolean;
}

export function ActivityEventRow({ event, isNew }: ActivityEventProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 py-2.5 px-3 rounded-lg transition-all duration-300',
      isNew && 'bg-blue-50/50 animate-in fade-in slide-in-from-top-1'
    )}>
      {/* Timestamp */}
      <span className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5 w-16">
        {event.timestamp}
      </span>

      {/* Status icon */}
      <div className="shrink-0 pt-0.5">
        {event.type === 'success' && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
        {event.type === 'warning' && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        {event.type === 'active' && (
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-3 w-3 rounded-full bg-blue-400 animate-ping opacity-40" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
        )}
        {event.type === 'info' && (
          <Info className="h-4 w-4 text-slate-400" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug">
          {event.action}
        </p>
        {event.metadata && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {event.metadata}
          </p>
        )}
      </div>
    </div>
  );
}
