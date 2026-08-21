import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionAbsenceSummary, RiskLevel } from '@/types';
import { Users, Clock, Phone, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { RiskBadge } from '@/components/ai-operations/RiskBadge';
import { Button } from '@/components/ui/Button';

interface SectionAbsenceQueueProps {
  sections: SectionAbsenceSummary[];
  onNavigateToOperations?: () => void;
}

export function SectionAbsenceQueue({ sections, onNavigateToOperations }: SectionAbsenceQueueProps) {
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>(sections[0]?.section || 'CSE-A');

  const currentSection = sections.find(s => s.section === selectedSectionCode) || sections[0];

  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Section-Wise Absence & Pending Call Queue</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active tracking of pending absences and automated voice follow-ups across each academic section.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/80 rounded-lg border border-border overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.section}
              onClick={() => setSelectedSectionCode(s.section)}
              className={cn(
                'px-3 py-1 text-xs font-bold rounded-md transition-default whitespace-nowrap cursor-pointer',
                selectedSectionCode === s.section
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.section}
              {s.pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  {s.pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {currentSection && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Section Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-muted-foreground font-medium">Total Absences</span>
              <p className="text-lg font-extrabold text-foreground mt-0.5">{currentSection.absentCount} students</p>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Pending Calls
              </span>
              <p className="text-lg font-extrabold text-amber-900 mt-0.5">{currentSection.pendingCount} in queue</p>
            </div>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
              <span className="text-blue-800 font-semibold flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Calling Live
              </span>
              <p className="text-lg font-extrabold text-blue-900 mt-0.5">{currentSection.callingCount} active</p>
            </div>

            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
              <p className="text-lg font-extrabold text-emerald-900 mt-0.5">{currentSection.completedCount} verified</p>
            </div>
          </div>

          {/* Pending Students List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Students in Pending Follow-Up Queue ({currentSection.pendingStudents.length}):
              </span>
              {onNavigateToOperations && (
                <button
                  onClick={onNavigateToOperations}
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Manage in AI Operations
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {currentSection.pendingStudents.length === 0 ? (
              <div className="p-6 text-center rounded-lg border border-dashed border-border bg-muted/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-foreground font-semibold">No pending absences in {currentSection.section}</p>
                <p className="text-[11px] text-muted-foreground">All absent students have been contacted or attendance is 100%.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSection.pendingStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl border border-border bg-background flex items-center justify-between hover:border-amber-300 transition-colors shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{student.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">({student.rollNumber})</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground/70" />
                        <span>Guardian: {student.parentName}</span>
                        <span className="font-mono text-[11px]">({student.parentPhone})</span>
                      </p>
                      <p className="text-[11px] text-amber-700 font-semibold">
                        {student.consecutiveAbsences} consecutive absence{student.consecutiveAbsences > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <RiskBadge level={student.riskLevel} />
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        Queued
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
