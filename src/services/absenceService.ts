import { AbsenceCase, RiskLevel } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateRisk, getConsecutiveAbsences } from './riskService';

export interface AbsenceCaseResult {
  caseId: string;
  studentId: string;
  riskLevel: RiskLevel;
  status: 'pending';
}

/**
 * Creates absence_cases records in Supabase for all absent students
 * with deterministic risk calculation and status = 'pending'.
 */
export async function createAbsenceCases(
  absentStudents: Array<{ id: string; studentId: string; name: string; attendancePercentage: number }>,
  date: string,
  attendanceMap?: Map<string, string> // studentId -> attendance_id
): Promise<AbsenceCaseResult[]> {
  const results: AbsenceCaseResult[] = [];

  if (!isSupabaseConfigured || !supabase) {
    return absentStudents.map((s) => {
      const risk = calculateRisk(s.attendancePercentage, 1);
      return {
        caseId: `sim-case-${Date.now()}-${s.studentId}`,
        studentId: s.id,
        riskLevel: risk.riskLevel,
        status: 'pending',
      };
    });
  }

  try {
    for (const student of absentStudents) {
      // 1. Calculate consecutive absences
      const consecutive = await getConsecutiveAbsences(student.id, date);

      // 2. Deterministic Risk Evaluation
      const riskResult = calculateRisk(student.attendancePercentage, consecutive);
      const requiresFollowUp = riskResult.riskLevel === 'high';
      const aiRecommendation = requiresFollowUp
        ? `Faculty intervention recommended: ${riskResult.reasons.join(', ')}.`
        : 'Automated parent notification queued.';

      const attendanceId = attendanceMap?.get(student.id);

      // 3. Check if an absence case already exists for this student & date
      const { data: existingCase } = await supabase
        .from('absence_cases')
        .select('id')
        .eq('student_id', student.id)
        .eq('date', date)
        .maybeSingle();

      if (existingCase) {
        // Update existing case
        const { data: updatedCase } = await supabase
          .from('absence_cases')
          .update({
            attendance_id: attendanceId || null,
            status: 'pending',
            risk_level: riskResult.riskLevel,
            consecutive_absences: consecutive,
            follow_up_required: requiresFollowUp,
            ai_recommendation: aiRecommendation,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCase.id)
          .select('id')
          .single();

        if (updatedCase) {
          results.push({
            caseId: updatedCase.id,
            studentId: student.id,
            riskLevel: riskResult.riskLevel,
            status: 'pending',
          });
        }
      } else {
        // Insert new absence case
        const { data: insertedCase, error: insertErr } = await supabase
          .from('absence_cases')
          .insert({
            student_id: student.id,
            attendance_id: attendanceId || null,
            date,
            status: 'pending',
            risk_level: riskResult.riskLevel,
            consecutive_absences: consecutive,
            follow_up_required: requiresFollowUp,
            ai_recommendation: aiRecommendation,
          })
          .select('id')
          .single();

        if (insertedCase) {
          results.push({
            caseId: insertedCase.id,
            studentId: student.id,
            riskLevel: riskResult.riskLevel,
            status: 'pending',
          });
        } else if (insertErr) {
          console.error(`Failed to insert absence case for student ${student.name}:`, insertErr.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in createAbsenceCases:', err);
  }

  return results;
}
