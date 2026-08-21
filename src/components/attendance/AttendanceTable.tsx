import React from 'react';
import { cn } from '@/lib/utils';
import { Student } from '@/types';
import { AttendanceStatusToggle } from './AttendanceStatusToggle';
import { AlertCircle } from 'lucide-react';

interface AttendanceTableProps {
  students: Student[];
  onToggleStatus: (studentId: string) => void;
}

export function AttendanceTable({ students, onToggleStatus }: AttendanceTableProps) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                Student
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                Gender
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                Roll Number
              </th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                Historical Attendance
              </th>
              <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                Today's Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {students.map((student) => {
              const initials = student.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);

              const isAbsent = student.status === 'absent';
              const isFemale = student.gender === 'female';

              return (
                <tr
                  key={student.id}
                  className={cn(
                    'transition-colors duration-150 relative',
                    isAbsent
                      ? 'bg-neutral-100 hover:bg-neutral-150'
                      : 'hover:bg-neutral-50/60'
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                        isAbsent
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-800'
                      )}>
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-sm font-semibold',
                            isAbsent ? 'text-black font-bold' : 'text-black'
                          )}>
                            {student.name}
                          </span>
                          {isAbsent && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black px-1.5 py-0.5 rounded">
                              <AlertCircle className="h-3 w-3" />
                              ABSENT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border',
                      isFemale
                        ? 'bg-neutral-100 text-black border-neutral-300'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                    )}>
                      {isFemale ? 'Girl (Daughter)' : 'Boy (Son)'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-mono text-neutral-600 font-medium">
                      {student.rollNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${Math.min(student.attendancePercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-black">
                        {student.attendancePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <AttendanceStatusToggle
                      status={student.status}
                      studentName={student.name}
                      onToggle={() => onToggleStatus(student.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden divide-y divide-neutral-200">
        {students.map((student) => (
          <div
            key={student.id}
            className={cn(
              'p-4 space-y-3 transition-colors duration-150',
              student.status === 'absent' ? 'bg-neutral-100' : ''
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-black">{student.name}</p>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {student.rollNumber} · {student.gender === 'female' ? 'Girl' : 'Boy'}
                </p>
              </div>
              <AttendanceStatusToggle
                status={student.status}
                studentName={student.name}
                onToggle={() => onToggleStatus(student.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
