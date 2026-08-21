import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { StudentCallLog } from '@/types';
import { Phone, Clock, FileText, Calendar, Search, CheckCircle2, AlertCircle, PhoneIncoming, PhoneOff } from 'lucide-react';
import { CommunicationStatus } from '@/components/ai-operations/CommunicationStatus';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DailyCallLogsTableProps {
  callLogs: StudentCallLog[];
}

export function DailyCallLogsTable({ callLogs }: DailyCallLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<StudentCallLog | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const uniqueDates = Array.from(new Set(callLogs.map(c => c.date)));

  const filteredLogs = callLogs.filter(log => {
    if (dateFilter !== 'all' && log.date !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.studentName.toLowerCase().includes(q) ||
        log.rollNumber.toLowerCase().includes(q) ||
        log.parentName.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PhoneIncoming className="h-4 w-4 text-indigo-600" />
            <h3 className="text-base font-bold text-foreground">Daily Student Call Logs & Voice Timestamps</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Per-student parent call audit log with exact start time, end time, duration, and extracted outcome.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student or parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background focus-ring w-44 sm:w-56"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-border bg-background focus-ring cursor-pointer"
          >
            <option value="all">All Dates</option>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Call Date</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Call Timestamps</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Parent Contact</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Extracted Reason</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Transcript</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const initials = log.studentName.split(' ').map(n => n[0]).join('').slice(0, 2);

              return (
                <tr
                  key={log.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{log.studentName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{log.rollNumber} · {log.section}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                    {log.date}
                  </td>

                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Clock className="h-3 w-3 text-indigo-600 shrink-0" />
                        <span>Started: <strong className="font-semibold">{log.callStartedAt}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>Ended: {log.callEndedAt} ({log.durationSeconds}s)</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{log.parentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{log.parentPhone}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <CommunicationStatus status={log.status} />
                  </td>

                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded border inline-block",
                      log.reasonCategory === 'medical' ? 'bg-red-50 text-red-700 border-red-200 font-semibold' :
                      log.reasonCategory === 'family' ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' :
                      log.reasonCategory === 'transportation' ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' :
                      'bg-muted text-foreground border-border'
                    )}>
                      {log.reason || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="p-1.5 hover:bg-muted rounded text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transcript Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Voice Call Transcript & Analysis"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">{selectedLog.studentName} ({selectedLog.rollNumber})</h4>
                <p className="text-xs text-muted-foreground">Parent: {selectedLog.parentName} · {selectedLog.parentPhone}</p>
              </div>
              <CommunicationStatus status={selectedLog.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-background">
                <span className="text-muted-foreground">Call Started:</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{selectedLog.date} · {selectedLog.callStartedAt}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background">
                <span className="text-muted-foreground">Call Ended & Duration:</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{selectedLog.callEndedAt} ({selectedLog.durationSeconds}s)</p>
              </div>
            </div>

            {selectedLog.reason && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">Extracted Reason:</span>
                <p className="text-emerald-800 font-semibold mt-0.5">{selectedLog.reason} ({selectedLog.reasonCategory})</p>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verbatim Call Transcript:</span>
              <div className="p-3.5 rounded-xl border border-border bg-background text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground max-h-48 overflow-y-auto">
                {selectedLog.transcript || 'No transcript recorded.'}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
