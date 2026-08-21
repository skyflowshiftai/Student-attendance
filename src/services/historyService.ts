import { HistoricalAttendanceSession } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function fetchAttendanceHistory(): Promise<HistoricalAttendanceSession[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch attendance records grouped by date, class_section, subject
      const { data: attendanceData, error: attErr } = await supabase
        .from('attendance')
        .select(`
          date, class_section, subject, status, faculty_id,
          students(name, roll_number)
        `)
        .order('date', { ascending: false });

      if (!attErr && attendanceData && attendanceData.length > 0) {
        // Group by date + class_section + subject
        const sessionMap = new Map<string, {
          date: string;
          classSection: string;
          subject: string;
          totalCount: number;
          presentCount: number;
          absentCount: number;
          absentStudents: Array<{
            name: string;
            rollNumber: string;
            riskLevel: 'low' | 'medium' | 'high';
          }>;
        }>();

        attendanceData.forEach((row: any) => {
          const key = `${row.date}_${row.class_section || 'CSE-A'}_${row.subject || 'Artificial Intelligence'}`;
          if (!sessionMap.has(key)) {
            sessionMap.set(key, {
              date: row.date,
              classSection: row.class_section || 'CSE-A',
              subject: row.subject || 'Artificial Intelligence',
              totalCount: 0,
              presentCount: 0,
              absentCount: 0,
              absentStudents: [],
            });
          }
          const item = sessionMap.get(key)!;
          item.totalCount += 1;
          if (row.status === 'present') {
            item.presentCount += 1;
          } else {
            item.absentCount += 1;
            const student = row.students || {};
            item.absentStudents.push({
              name: student.name || 'Absent Student',
              rollNumber: student.roll_number || 'N/A',
              riskLevel: 'high',
            });
          }
        });

        // Convert to array
        const result: HistoricalAttendanceSession[] = Array.from(sessionMap.entries()).map(([key, s], idx) => {
          const compliance = s.totalCount > 0 ? Math.round((s.presentCount / s.totalCount) * 100) : 0;
          return {
            id: `session-${idx + 1}`,
            date: s.date,
            subject: s.subject,
            classSection: s.classSection,
            facultyName: 'Mr. Venkateshwar',
            totalStudents: s.totalCount,
            presentCount: s.presentCount,
            absentCount: s.absentCount,
            complianceRate: compliance,
            aiProcessed: s.absentCount > 0,
            absentStudents: s.absentStudents,
          };
        });

        if (result.length > 0) return result;
      }
    } catch (err) {
      console.warn('Error fetching live history:', err);
    }
  }

  // Fallback empty list if no history recorded yet
  return [];
}
