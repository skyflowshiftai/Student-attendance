import React from 'react';
import { cn } from '@/lib/utils';
import { UserX, UserCheck } from 'lucide-react';

interface AttendanceStatusToggleProps {
  status: 'present' | 'absent';
  onToggle: () => void;
  studentName: string;
}

export function AttendanceStatusToggle({ status, onToggle, studentName }: AttendanceStatusToggleProps) {
  return (
    <div
      className="inline-flex items-center p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer"
      role="radiogroup"
      aria-label={`Attendance status for ${studentName}`}
    >
      <button
        role="radio"
        aria-checked={status === 'present'}
        onClick={() => status !== 'present' && onToggle()}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
          status === 'present'
            ? 'bg-white text-black shadow-xs border border-neutral-300'
            : 'text-neutral-500 hover:text-black'
        )}
      >
        <UserCheck className={cn('h-3.5 w-3.5', status === 'present' ? 'text-black' : 'text-neutral-400')} />
        Present
      </button>
      <button
        role="radio"
        aria-checked={status === 'absent'}
        onClick={() => status !== 'absent' && onToggle()}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
          status === 'absent'
            ? 'bg-black text-white shadow-xs'
            : 'text-neutral-500 hover:text-black'
        )}
      >
        <UserX className={cn('h-3.5 w-3.5', status === 'absent' ? 'text-white' : 'text-neutral-400')} />
        Absent
      </button>
    </div>
  );
}
