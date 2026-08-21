import React from 'react';
import { cn } from '@/lib/utils';
import { Search, RotateCcw } from 'lucide-react';
import { AttendanceFilter } from '@/types';

interface StudentSearchProps {
  searchQuery: string;
  filter: AttendanceFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: AttendanceFilter) => void;
  onMarkAllPresent: () => void;
}

const filters: { value: AttendanceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
];

export function StudentSearch({
  searchQuery,
  filter,
  onSearchChange,
  onFilterChange,
  onMarkAllPresent,
}: StudentSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-border',
            'bg-background text-foreground placeholder:text-muted-foreground',
            'transition-default focus-ring',
            'hover:border-muted-foreground/30'
          )}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-default',
              filter === f.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mark all present */}
      <button
        onClick={onMarkAllPresent}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-default ml-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Mark all present
      </button>
    </div>
  );
}
