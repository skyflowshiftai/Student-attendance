import { AbsenceCase, ActivityEvent, OperationsMetrics, RecentAction, StudentCallLog, SectionAbsenceSummary } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const emptyMetrics: OperationsMetrics = {
  absencesDetected: 0,
  callsInProgress: 0,
  callsCompleted: 0,
  followUpsRequired: 0,
  highRiskStudents: 0,
};

export async function getTodayOperations(): Promise<OperationsMetrics> {
  if (isSupabaseConfigured && supabase) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: cases } = await supabase
        .from('absence_cases')
        .select('status, risk_level, follow_up_required')
        .eq('date', today);

      if (cases && cases.length > 0) {
        return {
          absencesDetected: cases.length,
          callsInProgress: cases.filter(c => c.status === 'calling').length,
          callsCompleted: cases.filter(c => c.status === 'completed').length,
          followUpsRequired: cases.filter(c => c.follow_up_required || c.status === 'follow_up').length,
          highRiskStudents: cases.filter(c => c.risk_level === 'high').length,
        };
      }
    } catch (err) {
      console.warn('Error fetching live operations metrics:', err);
    }
  }

  return emptyMetrics;
}

export async function getActiveAbsenceCases(): Promise<AbsenceCase[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: cases, error } = await supabase
        .from('absence_cases')
        .select(`
          id, date, status, reason, reason_category, risk_level, consecutive_absences, follow_up_required, ai_recommendation,
          students(id, student_id, name, roll_number, class_section, gender, historical_attendance_pct, parent_name, parent_phone, location)
        `)
        .eq('date', today);

      if (!error && cases && cases.length > 0) {
        return cases.map((c: any) => {
          const rawStudent = Array.isArray(c.students) ? c.students[0] : c.students;
          const student = rawStudent || {};
          const isCalling = c.status === 'calling';
          const isCompleted = c.status === 'completed';

          return {
            id: c.id,
            student: {
              id: student.id || c.id,
              name: student.name || '—',
              rollNumber: student.roll_number || '—',
              section: student.class_section || '—',
              gender: student.gender || 'male',
              attendancePercentage: Number(student.historical_attendance_pct) || 0,
              parentName: student.parent_name || '—',
              parentPhone: student.parent_phone || '—',
              location: student.location || '—',
            },
            absencePattern: `${c.consecutive_absences || 1} consecutive absence${(c.consecutive_absences || 1) > 1 ? 's' : ''}`,
            consecutiveAbsences: c.consecutive_absences || 1,
            riskLevel: c.risk_level || 'low',
            callStatus: c.status || 'pending',
            caseStatus: isCompleted ? 'resolved' : isCalling ? 'in_progress' : 'pending',
            reason: c.reason || null,
            reasonCategory: c.reason_category || null,
            aiRecommendation: c.ai_recommendation || 'Automated parent notification queued.',
            requiresAttention: Boolean(c.follow_up_required || c.risk_level === 'high'),
            attentionReason: c.follow_up_required ? 'Flagged for faculty review' : undefined,
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching live absence cases:', err);
    }
  }

  return [];
}

export async function getDailyCallLogs(dateFilter?: string): Promise<StudentCallLog[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const query = supabase
        .from('calls')
        .select(`
          id, retell_call_id, status, duration, duration_seconds, transcript, analysis, created_at, updated_at,
          students(id, student_id, name, roll_number, class_section, parent_name, parent_phone),
          absence_cases(date, reason, reason_category)
        `)
        .order('created_at', { ascending: false });

      const { data: liveCalls, error } = await query;

      if (!error && liveCalls && liveCalls.length > 0) {
        return liveCalls.map((call: any) => {
          const student = call.students || {};
          const absence = call.absence_cases || {};
          const customData = call.analysis?.custom_analysis_data || {};
          const callCreated = new Date(call.created_at || Date.now());
          const duration = call.duration_seconds || 0;
          const callEnded = duration > 0 ? new Date(callCreated.getTime() + duration * 1000) : null;

          return {
            id: call.id,
            studentId: student.student_id || student.id || '—',
            studentName: student.name || '—',
            rollNumber: student.roll_number || '—',
            section: student.class_section || '—',
            date: absence.date || callCreated.toISOString().slice(0, 10),
            callStartedAt: callCreated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            callEndedAt: callEnded ? callEnded.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—',
            durationSeconds: duration,
            status: call.status || 'in-progress',
            parentName: student.parent_name || '—',
            parentPhone: student.parent_phone || '—',
            reason: absence.reason || customData.absence_reason || null,
            reasonCategory: absence.reason_category || customData.reason_category || null,
            retellCallId: call.retell_call_id,
            transcript: call.transcript || '—',
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching live call logs:', err);
    }
  }

  return [];
}

export async function getSectionAbsenceSummaries(): Promise<SectionAbsenceSummary[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // Get all sections from students table dynamically
      const { data: allStudents } = await supabase
        .from('students')
        .select('class_section')
        .not('class_section', 'is', null);

      const uniqueSections = [...new Set((allStudents || []).map((s: any) => s.class_section).filter(Boolean))];

      const { data: cases } = await supabase
        .from('absence_cases')
        .select(`
          id, status, risk_level, consecutive_absences,
          students(id, name, roll_number, class_section, department, parent_name, parent_phone)
        `)
        .eq('date', today);

      const sectionMap = new Map<string, SectionAbsenceSummary>();

      uniqueSections.forEach(sec => {
        sectionMap.set(sec, {
          section: sec,
          department: sec.startsWith('CSE') ? 'CSE' : sec.startsWith('ECE') ? 'ECE' : sec.startsWith('EEE') ? 'EEE' : 'Engineering',
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          pendingCount: 0,
          callingCount: 0,
          completedCount: 0,
          pendingStudents: [],
        });
      });

      if (cases && cases.length > 0) {
        cases.forEach((c: any) => {
          const student = c.students || {};
          const sec = student.class_section || 'Unknown';
          if (!sectionMap.has(sec)) {
            sectionMap.set(sec, {
              section: sec,
              department: student.department || 'Engineering',
              totalStudents: 0,
              presentCount: 0,
              absentCount: 0,
              pendingCount: 0,
              callingCount: 0,
              completedCount: 0,
              pendingStudents: [],
            });
          }
          const item = sectionMap.get(sec)!;
          item.absentCount += 1;

          if (c.status === 'completed') {
            item.completedCount += 1;
          } else if (c.status === 'calling') {
            item.callingCount += 1;
          } else {
            item.pendingCount += 1;
          }

          if (c.status !== 'completed') {
            item.pendingStudents.push({
              id: c.id,
              name: student.name || '—',
              rollNumber: student.roll_number || '—',
              parentName: student.parent_name || '—',
              parentPhone: student.parent_phone || '—',
              consecutiveAbsences: c.consecutive_absences || 1,
              riskLevel: c.risk_level || 'low',
            });
          }
        });
      }

      return Array.from(sectionMap.values());
    } catch (err) {
      console.warn('Error fetching section summaries:', err);
    }
  }

  return [];
}

export async function getActivityTimeline(): Promise<ActivityEvent[]> {
  return [];
}

export async function getRecentActions(): Promise<RecentAction[]> {
  return [];
}
