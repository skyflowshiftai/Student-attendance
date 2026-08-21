import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Users, 
  CheckCircle2, 
  Bot, 
  AlertTriangle, 
  ArrowUpRight, 
  ClipboardCheck, 
  TrendingUp, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck,
  Building2,
  Calendar,
  PhoneCall,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageId, StudentCallLog, SectionAbsenceSummary, Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { getDailyCallLogs, getSectionAbsenceSummaries } from '@/services/operationsService';
import { fetchStudents } from '@/services/studentService';
import { DailyCallLogsTable } from '@/components/dashboard/DailyCallLogsTable';
import { SectionAbsenceQueue } from '@/components/dashboard/SectionAbsenceQueue';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const today = new Date();
  const [callLogs, setCallLogs] = useState<StudentCallLog[]>([]);
  const [sectionSummaries, setSectionSummaries] = useState<SectionAbsenceSummary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const [logs, summaries, stuList] = await Promise.all([
        getDailyCallLogs(),
        getSectionAbsenceSummaries(),
        fetchStudents('CSE-A'),
      ]);
      setCallLogs(logs);
      setSectionSummaries(summaries);
      if (stuList) setStudents(stuList);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const [timeAgo, setTimeAgo] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const totalCallsToday = callLogs.length;
  const completedCallsToday = callLogs.filter(c => c.status === 'completed').length;
  const totalEnrolled = students.length;
  const atRiskCount = students.filter(s => s.attendancePercentage < 75).length;
  const totalAbsents = sectionSummaries.reduce((sum, s) => sum + s.absentCount, 0);
  const attendanceRate = totalEnrolled > 0 
    ? Math.round(((totalEnrolled - totalAbsents) / totalEnrolled) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[32px] font-bold text-black tracking-tight">
            Institutional Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Campus-wide intelligence, attendance analytics, and autonomous agent orchestration.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 shadow-xs">
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-black")} />
            Sync: {timeAgo}s ago
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 shadow-xs">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(today)}
          </div>
          <Button size="sm" onClick={() => onNavigate('attendance')}>
            <ClipboardCheck className="h-3.5 w-3.5" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Top Level Metric Cards (Pure Monochrome) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <Users className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <AnimatedCounter value={totalEnrolled} className="text-2xl font-extrabold text-black mt-2 block" />
          )}
          <p className="text-xs text-neutral-500 mt-1">Computer Science & Engg.</p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <AnimatedCounter value={attendanceRate} className="text-2xl font-extrabold text-black" />
              <span className="text-2xl font-extrabold text-black">%</span>
            </div>
          )}
          <p className="text-xs text-neutral-600 font-medium mt-1">
            {totalEnrolled === 0
              ? 'No students enrolled'
              : totalAbsents > 0
              ? `${totalAbsents} student${totalAbsents !== 1 ? 's' : ''} absent today`
              : 'All students present'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI Telecall Status</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-extrabold text-black mt-2">{completedCallsToday}/{totalCallsToday}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            {totalCallsToday > 0 ? `${completedCallsToday} parent call${completedCallsToday !== 1 ? 's' : ''} completed` : 'No calls pending'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">At-Risk Students</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <AnimatedCounter value={atRiskCount} className="text-2xl font-extrabold text-black mt-2 block" />
          )}
          <p className="text-xs text-neutral-500 mt-1">Attendance below 75% threshold</p>
        </div>
      </div>

      {/* 1. Daily Student Call Logs Table */}
      <DailyCallLogsTable callLogs={callLogs} />

      {/* 2. Section Absence Queues */}
      <SectionAbsenceQueue 
        sections={sectionSummaries}
        onNavigateToOperations={() => onNavigate('ai-operations')}
      />
    </div>
  );
}
