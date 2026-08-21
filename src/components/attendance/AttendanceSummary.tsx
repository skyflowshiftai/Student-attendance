import React from 'react';
import { cn } from '@/lib/utils';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { AttendanceStats } from '@/types';

interface AttendanceSummaryProps {
  stats: AttendanceStats;
}

export function AttendanceSummary({ stats }: AttendanceSummaryProps) {
  const cards = [
    {
      label: 'Total Students',
      value: stats.total,
      icon: Users,
    },
    {
      label: 'Present',
      value: stats.present,
      icon: UserCheck,
    },
    {
      label: 'Absent',
      value: stats.absent,
      icon: UserX,
    },
    {
      label: 'Attendance Rate',
      value: `${stats.percentage.toFixed(1)}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-neutral-200 bg-white shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold tracking-tight text-black">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
