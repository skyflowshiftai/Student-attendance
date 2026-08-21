import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HistoricalAttendanceSession } from '@/types';
import { Calendar, Download, Search, ChevronDown, ChevronUp, Bot, CheckCircle2, UserX, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchAttendanceHistory } from '@/services/historyService';

export function AttendanceHistoryPage() {
  const [sessions, setSessions] = useState<HistoricalAttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const liveSessions = await fetchAttendanceHistory();
        if (isMounted) {
          setSessions(liveSessions);
          if (liveSessions.length > 0 && liveSessions[0]) {
            setExpandedSessionId(liveSessions[0].id);
          }
        }
      } catch (err) {
        console.warn('Error loading history sessions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredSessions = sessions.filter((sess) => {
    if (selectedSubject !== 'all' && sess.subject !== selectedSubject) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const csvRows = [
      ['Date', 'Subject', 'Class Section', 'Faculty', 'Present', 'Absent', 'Compliance Rate'],
      ...sessions.map((s) => [
        s?.date || '',
        s?.subject || '',
        s?.classSection || '',
        s?.facultyName || '',
        String(s?.presentCount ?? 0),
        String(s?.absentCount ?? 0),
        `${s?.complianceRate ?? 0}%`,
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CampusPulse_Attendance_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[32px] font-bold text-foreground tracking-tight">
            Attendance History & Audit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete historical sessions, regulatory compliance rates, and automated AI parent call logs.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={sessions.length === 0}>
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Export Audit CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-3">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium focus-ring cursor-pointer"
        >
          <option value="all">All Subjects</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Database Management Systems">Database Management Systems</option>
          <option value="Computer Networks">Computer Networks</option>
          <option value="Operating Systems">Operating Systems</option>
        </select>
        <span className="text-xs text-muted-foreground font-medium">
          Showing {filteredSessions.length} recorded session{filteredSessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading attendance history...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-xl bg-background text-muted-foreground text-sm">
          No historical attendance sessions recorded yet. Once attendance is submitted, audit records appear here automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const dayOfWeek = new Date(session.date).toLocaleDateString('en-IN', { weekday: 'long' });

            return (
              <div
                key={session.id}
                className="border border-border rounded-xl bg-background overflow-hidden shadow-xs"
              >
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground shrink-0 font-bold text-xs">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{session.date}</span>
                        <span className="text-xs text-muted-foreground">({dayOfWeek})</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.subject} · {session.classSection} · Faculty: {session.facultyName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-700 font-bold">{session.presentCount} Present</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-red-700 font-bold">{session.absentCount} Absent</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{session.complianceRate}% Compliance</p>
                    </div>

                    <Badge variant={session.complianceRate >= 85 ? 'success' : 'warning'}>
                      {session.complianceRate >= 85 ? 'Compliant' : 'Warning'}
                    </Badge>

                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
