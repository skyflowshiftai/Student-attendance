import { Student } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function inferGenderFromName(name: string): 'male' | 'female' {
  const femalePatterns = ['devi', 'priya', 'sneha', 'kavya', 'divya', 'ananya', 'pooja', 'anjali', 'swathi', 'deepika', 'nithya', 'meera', 'lakshmi', 'rani', 'kumari'];
  const lower = name.toLowerCase();
  for (const p of femalePatterns) {
    if (lower.includes(p)) return 'female';
  }
  return 'male';
}

export async function fetchStudents(
  section: string = 'CSE-A',
  department?: string
): Promise<Student[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('students')
        .select('*')
        .eq('class_section', section)
        .order('roll_number', { ascending: true });

      if (department) {
        query = query.eq('department', department);
      }

      const { data, error } = await query;

      if (!error && data) {
        // Query all historical attendance rows to compute real database attendance %
        const { data: allAttendance } = await supabase
          .from('attendance')
          .select('student_id, status');

        const studentStatsMap = new Map<string, { total: number; present: number }>();
        if (allAttendance) {
          allAttendance.forEach((att: any) => {
            const prev = studentStatsMap.get(att.student_id) || { total: 0, present: 0 };
            prev.total += 1;
            if (att.status === 'present') prev.present += 1;
            studentStatsMap.set(att.student_id, prev);
          });
        }

        return data.map((s: any) => {
          const stats = studentStatsMap.get(s.id);
          const computedPct = stats && stats.total > 0
            ? Math.round((stats.present / stats.total) * 100)
            : (Number(s.historical_attendance_pct) || 85);

          return {
            id: s.id,
            studentId: s.student_id,
            name: s.name,
            rollNumber: s.roll_number,
            department: s.department,
            section: s.class_section,
            gender: s.gender || inferGenderFromName(s.name),
            attendancePercentage: computedPct,
            status: 'present' as const,
            parentName: s.parent_name,
            parentPhone: s.parent_phone,
            location: s.location,
            preferredLanguage: s.preferred_language,
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch students from Supabase:', err);
    }
  }

  return [];
}

export async function fetchStudentById(studentId: string): Promise<Student | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`id.eq.${studentId},student_id.eq.${studentId}`)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          name: data.name,
          rollNumber: data.roll_number,
          department: data.department,
          section: data.class_section,
          gender: data.gender || inferGenderFromName(data.name),
          attendancePercentage: Number(data.historical_attendance_pct) || 85,
          status: 'present' as const,
          parentName: data.parent_name,
          parentPhone: data.parent_phone,
          location: data.location,
          preferredLanguage: data.preferred_language,
        };
      }
    } catch (err) {
      console.warn('Error fetching student by ID:', err);
    }
  }

  return null;
}

export async function createStudent(newStudent: {
  name: string;
  rollNumber: string;
  department: string;
  section: string;
  parentName: string;
  parentPhone: string;
  gender?: 'male' | 'female' | 'other';
  preferredLanguage?: string;
  attendancePercentage?: number;
  location?: string;
}): Promise<Student | null> {
  const studentId = `STU${Date.now().toString().slice(-4)}`;
  const formattedPct = newStudent.attendancePercentage || 85;
  const gender = newStudent.gender || inferGenderFromName(newStudent.name);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        student_id: studentId,
        name: newStudent.name,
        roll_number: newStudent.rollNumber,
        department: newStudent.department,
        class_section: newStudent.section,
        parent_name: newStudent.parentName,
        parent_phone: newStudent.parentPhone,
        preferred_language: newStudent.preferredLanguage || 'English',
        historical_attendance_pct: formattedPct,
        location: newStudent.location || 'Visakhapatnam',
      };

      // Safely try inserting with gender
      try {
        payload.gender = gender;
      } catch (_) {}

      const { data, error } = await supabase
        .from('students')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          studentId: data.student_id,
          name: data.name,
          rollNumber: data.roll_number,
          department: data.department,
          section: data.class_section,
          gender: data.gender || gender,
          attendancePercentage: Number(data.historical_attendance_pct) || formattedPct,
          status: 'present' as const,
          parentName: data.parent_name,
          parentPhone: data.parent_phone,
          location: data.location,
          preferredLanguage: data.preferred_language,
        };
      }
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  }

  return null;
}

export async function bulkCreateStudents(studentsList: Array<{
  name: string;
  rollNumber: string;
  department: string;
  section: string;
  parentName: string;
  parentPhone: string;
  gender?: 'male' | 'female';
  attendancePercentage: number;
}>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const payloads = studentsList.map((s, idx) => ({
      student_id: `STU${Date.now().toString().slice(-4)}${idx}`,
      name: s.name,
      roll_number: s.rollNumber,
      department: s.department,
      class_section: s.section,
      gender: s.gender || inferGenderFromName(s.name),
      parent_name: s.parentName,
      parent_phone: s.parentPhone,
      preferred_language: 'English',
      historical_attendance_pct: s.attendancePercentage,
      location: 'Visakhapatnam',
    }));

    const { error } = await supabase.from('students').insert(payloads);
    return !error;
  } catch (err) {
    console.error('Bulk student creation failed:', err);
    return false;
  }
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Failed to delete student:', err);
    return false;
  }
}
