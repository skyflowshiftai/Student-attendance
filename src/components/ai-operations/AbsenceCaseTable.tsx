import React from 'react';
import { cn } from '@/lib/utils';
import { Users, Eye, PhoneCall } from 'lucide-react';
import { AbsenceCase } from '@/types';
import { RiskBadge } from './RiskBadge';
import { CommunicationStatus } from './CommunicationStatus';

interface AbsenceCaseTableProps {
  cases: AbsenceCase[];
  onSelectCase?: (absenceCase: AbsenceCase) => void;
  onInitiateLiveCall?: (absenceCase: AbsenceCase) => void;
}

export function AbsenceCaseTable({ cases, onSelectCase, onInitiateLiveCall }: AbsenceCaseTableProps) {
  if (cases.length === 0) {
    return (
      <div className="border border-neutral-200 rounded-xl p-8 text-center bg-white">
        <Users className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-black">No Active Absence Cases</h3>
        <p className="text-xs text-neutral-500 mt-1">
          When students are marked absent in the Attendance Portal, automated cases and calling queues appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-neutral-500" />
        <div>
          <h3 className="text-base font-bold text-black">Active Absence Cases</h3>
          <p className="text-xs text-neutral-500">Students currently being processed by CampusPulse AI</p>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Attendance</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Pattern</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">AI Risk</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Communication</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Reason</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {cases.map((c) => {
                const studentName = c.student?.name || 'Student';
                const initials = studentName.split(' ').map(n => n[0]).join('').slice(0, 2);
                return (
                  <tr key={c.id} className={cn(
                    'transition-colors duration-150 cursor-pointer',
                    c.callStatus === 'calling' ? 'bg-neutral-100' : 'hover:bg-neutral-50/60'
                  )}>
                    <td className="px-4 py-3" onClick={() => onSelectCase?.(c)}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black">{studentName}</p>
                          <p className="text-xs font-mono text-neutral-500">{c.student?.rollNumber} · {c.student?.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={() => onSelectCase?.(c)}>
                      <span className="text-sm font-bold text-black">{c.student?.attendancePercentage}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600 font-medium" onClick={() => onSelectCase?.(c)}>
                      {c.consecutiveAbsences} consecutive
                    </td>
                    <td className="px-4 py-3" onClick={() => onSelectCase?.(c)}>
                      <RiskBadge level={c.riskLevel} />
                    </td>
                    <td className="px-4 py-3" onClick={() => onSelectCase?.(c)}>
                      <CommunicationStatus status={c.callStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs text-black font-medium" onClick={() => onSelectCase?.(c)}>
                      {c.reason || 'Pending AI Verification'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onInitiateLiveCall && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInitiateLiveCall(c);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition-default cursor-pointer"
                            title="Trigger Real Phone Call"
                          >
                            <PhoneCall className="h-3 w-3" />
                            Call
                          </button>
                        )}
                        <button
                          onClick={() => onSelectCase?.(c)}
                          className="p-1 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-default cursor-pointer"
                          aria-label="View case details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
