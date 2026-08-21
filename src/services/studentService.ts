import { Student } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
        return data.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          name: s.name,
          rollNumber: s.roll_number,
          department: s.department,
          section: s.class_section,
          attendancePercentage: Number(s.historical_attendance_pct) || 85,
          status: 'present' as const,
          parentName: s.parent_name,
          parentPhone: s.parent_phone,
          location: s.location,
          preferredLanguage: s.preferred_language,
        }));
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
  preferredLanguage?: string;
  attendancePercentage?: number;
  location?: string;
}): Promise<Student | null> {
  const studentId = `STU${Date.now().toString().slice(-4)}`;
  const formattedPct = newStudent.attendancePercentage || 85;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          student_id: studentId,
          name: newStudent.name,
          roll_number: newStudent.rollNumber,
          department: newStudent.department,
          class_section: newStudent.section,
          parent_name: newStudent.parentName,
          parent_phone: newStudent.parentPhone,
          preferred_language: newStudent.preferredLanguage || 'Telugu',
          historical_attendance_pct: formattedPct,
          location: newStudent.location || 'Visakhapatnam',
        })
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
          attendancePercentage: Number(data.historical_attendance_pct) || formattedPct,
          status: 'present',
          parentName: data.parent_name,
          parentPhone: data.parent_phone,
          location: data.location,
          preferredLanguage: data.preferred_language,
        };
      }
    } catch (err) {
      console.warn('Error inserting student in Supabase:', err);
    }
  }

  return null;
}

export async function bulkCreateStudents(studentsList: Array<{
  name: string;
  rollNumber: string;
  department?: string;
  section?: string;
  parentName?: string;
  parentPhone?: string;
  preferredLanguage?: string;
  attendancePercentage?: number;
  location?: string;
}>): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, count: 0, error: 'Database not configured' };
  }

  try {
    const payload = studentsList.map((s, idx) => {
      let cleanPhone = (s.parentPhone || '').replace(/[^0-9+]/g, '');
      if (cleanPhone && !cleanPhone.startsWith('+')) {
        if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
        else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = '+' + cleanPhone;
      }

      return {
        student_id: `STU${(Date.now() + idx).toString().slice(-4)}`,
        name: s.name.trim(),
        roll_number: s.rollNumber.trim().toUpperCase(),
        department: s.department || 'Computer Science & Engineering',
        class_section: s.section || 'CSE-A',
        parent_name: s.parentName || 'Guardian',
        parent_phone: cleanPhone || '+916303318876',
        preferred_language: s.preferredLanguage || 'Telugu',
        historical_attendance_pct: s.attendancePercentage || 85,
        location: s.location || 'Visakhapatnam',
      };
    });

    const { data, error } = await supabase
      .from('students')
      .insert(payload)
      .select('id');

    if (error) {
      console.error('Bulk student insert error:', error.message);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err: any) {
    console.error('Bulk student insert exception:', err);
    return { success: false, count: 0, error: err.message };
  }
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    return !error;
  } catch (err) {
    console.warn('Error deleting student:', err);
    return false;
  }
}

