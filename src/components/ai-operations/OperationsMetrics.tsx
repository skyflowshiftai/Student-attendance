import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Phone, PhoneCall, PhoneOff, UserX, ShieldAlert } from 'lucide-react';
import { OperationsMetrics as OperationsMetricsType } from '@/types';

interface OperationsMetricsProps {
  metrics: OperationsMetricsType;
}

export function OperationsMetrics({ metrics }: OperationsMetricsProps) {
  const cards = [
    {
      label: 'Absences Detected',
      value: metrics.absencesDetected,
      context: `+${metrics.absencesDetected} today`,
      icon: UserX,
    },
    {
      label: 'Calls In Progress',
      value: metrics.callsInProgress,
      context: metrics.callsInProgress > 0 ? 'Live' : 'None',
      icon: PhoneCall,
      pulse: metrics.callsInProgress > 0,
    },
    {
      label: 'Calls Completed',
      value: metrics.callsCompleted,
      context: metrics.absencesDetected > 0
        ? `${Math.round((metrics.callsCompleted / metrics.absencesDetected) * 100)}% complete`
        : '0% complete',
      icon: Phone,
    },
    {
      label: 'Follow-ups Required',
      value: metrics.followUpsRequired,
      context: metrics.followUpsRequired > 0 ? 'Needs attention' : 'All clear',
      icon: PhoneOff,
    },
    {
      label: 'High-Risk Students',
      value: metrics.highRiskStudents,
      context: metrics.highRiskStudents > 0 ? 'Immediate review' : 'None',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-neutral-200 bg-white shadow-xs"
          >
            <div className="relative w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-black">
              <Icon className="h-[18px] w-[18px]" />
              {card.pulse && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-black tracking-tight">{card.value}</p>
              <p className="text-xs text-neutral-500 truncate">{card.label}</p>
              <p className="text-[10px] font-medium text-neutral-400 mt-0.5">{card.context}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
