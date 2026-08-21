import React from 'react';
import { SystemStatus } from './SystemStatus';
import { formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export function OperationsHeader() {
  const today = new Date();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-[32px] font-bold text-black tracking-tight">
          AI Telecall Operations
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Autonomous parent telecalling, NLP reason extraction, and absence governance.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 shadow-xs">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(today)}
        </div>
        <SystemStatus mode="live" />
      </div>
    </div>
  );
}
