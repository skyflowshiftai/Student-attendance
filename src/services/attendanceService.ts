import { AttendanceRecord, Student } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchStudents } from './studentService';
import { createAbsenceCases } from './absenceService';
import { placeRealTwilioPhoneCall } from './voiceCallService';

export interface SubmitAttendanceResult {
  success: boolean;
  totalStudents: number;
  present: number;
  absent: number;
  absenceCaseIds: string[];
  message?: string;
  error?: string;
}

export async function getExistingAttendance(
  date: string,
  subject: string = 'Artificial Intelligence'
): Promise<Map<string, 'present' | 'absent'>> {
  const map = new Map<string, 'present' | 'absent'>();
  if (!isSupabaseConfigured || !supabase) return map;

  try {
    const { data } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('date', date)
      .eq('subject', subject);

    if (data) {
      data.forEach((row: any) => map.set(row.student_id, row.status));
    }
  } catch (err) {
    console.warn('Error reading attendance:', err);
  }

  return map;
}

export async function getStudentsWithAttendance(
  section: string = 'CSE-A',
  subject: string = 'Artificial Intelligence',
  date: string = new Date().toISOString().slice(0, 10)
): Promise<Student[]> {
  const students = await fetchStudents(section);
  const existing = await getExistingAttendance(date, subject);

  return students.map((s) => ({
    ...s,
    status: existing.get(s.id) || 'present',
  }));
}

export async function submitAttendance(
  record: AttendanceRecord
): Promise<SubmitAttendanceResult> {
  if (!record.attendance || record.attendance.length === 0) {
    return { success: false, totalStudents: 0, present: 0, absent: 0, absenceCaseIds: [], error: 'No students provided' };
  }

  const totalStudents = record.attendance.length;
  const presentCount = record.attendance.filter((a) => a.status === 'present').length;
  const absentRecords = record.attendance.filter((a) => a.status === 'absent');
  const absentCount = absentRecords.length;

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, totalStudents, present: presentCount, absent: absentCount, absenceCaseIds: [], error: 'Database unavailable' };
  }

  try {
    const subjectName = record.subjectId || 'Artificial Intelligence';

    // 1. Save attendance to Supabase
    const inserts = record.attendance.map((item) => ({
      student_id: item.studentId,
      date: record.date,
      status: item.status,
      subject: subjectName,
      marked_by: 'Mr. Venkateshwar',
    }));

    const { data: savedAttendance, error: attError } = await supabase
      .from('attendance')
      .upsert(inserts, { onConflict: 'student_id,date,subject' })
      .select('id, student_id');

    if (attError) throw new Error(attError.message);

    const attendanceMap = new Map<string, string>();
    if (savedAttendance) {
      savedAttendance.forEach((row: any) => attendanceMap.set(row.student_id, row.id));
    }

    // 2. Create absence cases & trigger real calls for absent students
    let absenceCaseIds: string[] = [];

    if (absentRecords.length > 0) {
      const absentIds = absentRecords.map((a) => a.studentId);
      const { data: absentStudentDetails } = await supabase
        .from('students')
        .select('id, student_id, name, roll_number, parent_name, parent_phone, gender, historical_attendance_pct')
        .in('id', absentIds);

      const caseResults = await createAbsenceCases(
        (absentStudentDetails || []).map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          name: s.name,
          attendancePercentage: Number(s.historical_attendance_pct) || 80,
        })),
        record.date,
        attendanceMap
      );

      absenceCaseIds = caseResults.map((c) => c.caseId);

      // Trigger outbound phone calls
      for (const studentDetail of (absentStudentDetails || [])) {
        const matchingCase = caseResults.find((c) => c.studentId === studentDetail.id);
        if (matchingCase) {
          try {
            await placeRealTwilioPhoneCall({
              caseId: matchingCase.caseId,
              studentId: studentDetail.id,
              studentName: studentDetail.name || 'Student',
              rollNumber: studentDetail.roll_number || '',
              parentName: studentDetail.parent_name || 'Guardian',
              parentPhone: studentDetail.parent_phone || '',
              gender: studentDetail.gender,
            });
          } catch (callErr) {
            console.warn('Call trigger notice:', callErr);
          }
        }
      }
    }

    return {
      success: true,
      totalStudents,
      present: presentCount,
      absent: absentCount,
      absenceCaseIds,
      message: `Recorded ${presentCount} present, ${absentCount} absent. Outbound calls triggered.`,
    };
  } catch (err: any) {
    return {
      success: false,
      totalStudents,
      present: presentCount,
      absent: absentCount,
      absenceCaseIds: [],
      error: err.message,
    };
  }
}
