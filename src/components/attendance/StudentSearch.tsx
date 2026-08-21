import React from 'react';
import { cn } from '@/lib/utils';
import { Search, RotateCcw, Users, User } from 'lucide-react';
import { AttendanceFilter } from '@/types';
import { GenderFilter } from '@/hooks/useAttendance';

interface StudentSearchProps {
  searchQuery: string;
  filter: AttendanceFilter;
  genderFilter?: GenderFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: AttendanceFilter) => void;
  onGenderFilterChange?: (gender: GenderFilter) => void;
  onMarkAllPresent: () => void;
}

const statusFilters: { value: AttendanceFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
];

const genderFilters: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'All Students' },
  { value: 'male', label: 'Boys Only' },
  { value: 'female', label: 'Girls Only' },
];

export function StudentSearch({
  searchQuery,
  filter,
  genderFilter = 'all',
  onSearchChange,
  onFilterChange,
  onGenderFilterChange,
  onMarkAllPresent,
}: StudentSearchProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search student or roll number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-black placeholder:text-neutral-400 focus-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Gender Filter (Optional: All / Boys / Girls) */}
        {onGenderFilterChange && (
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
            {genderFilters.map((g) => (
              <button
                key={g.value}
                onClick={() => onGenderFilterChange(g.value)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-default cursor-pointer',
                  genderFilter === g.value
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter (All / Present / Absent) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-default cursor-pointer',
                filter === f.value
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mark All Present */}
        <button
          onClick={onMarkAllPresent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 text-black hover:bg-neutral-200 transition-default cursor-pointer border border-neutral-200"
        >
          <RotateCcw className="h-3 w-3" />
          Mark All Present
        </button>
      </div>
    </div>
  );
}
