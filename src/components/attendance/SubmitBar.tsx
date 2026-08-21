import React from 'react';
import { Button } from '@/components/ui/Button';
import { Send, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SubmitBarProps {
  absentCount: number;
  totalCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SubmitBar({ absentCount, totalCount, onSubmit, isSubmitting }: SubmitBarProps) {
  return (
    <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-sm border border-neutral-300 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left info & AI indicator */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {absentCount > 0 ? (
            <>
              <span className="flex h-2 w-2 rounded-full bg-black animate-pulse" />
              <span className="text-black font-bold">
                {absentCount} {absentCount === 1 ? 'student' : 'students'} marked absent
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-black" />
              <span className="text-black font-medium">
                All {totalCount} students marked present
              </span>
            </>
          )}
        </div>
        
        <p className="text-xs text-neutral-500 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span>
            Attendance is saved securely. Absent students will be automatically processed by <strong className="font-semibold text-black">CampusPulse AI</strong>.
          </span>
        </p>
      </div>

      {/* Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          size="lg"
          onClick={onSubmit}
          loading={isSubmitting}
          className="w-full sm:w-auto px-8 font-semibold shadow-md bg-black text-white hover:bg-neutral-800"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </div>
    </div>
  );
}
