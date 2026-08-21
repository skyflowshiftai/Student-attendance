import { RiskLevel } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface RiskCalculationResult {
  riskLevel: RiskLevel;
  consecutiveAbsences: number;
  attendancePercentage: number;
  reasons: string[];
}

/**
 * Deterministic Risk Calculation Engine
 * 
 * Rules:
 * - IF attendance < 75% OR consecutive absences >= 3 => HIGH RISK
 * - ELSE IF attendance < 85% OR consecutive absences >= 2 => MEDIUM RISK
 * - ELSE => LOW RISK
 */
export function calculateRisk(
  attendancePercentage: number,
  consecutiveAbsences: number
): RiskCalculationResult {
  const reasons: string[] = [];

  if (consecutiveAbsences >= 3) {
    reasons.push(`${consecutiveAbsences} consecutive days absent`);
  }
  if (attendancePercentage < 75) {
    reasons.push(`Attendance at ${attendancePercentage.toFixed(1)}% (below statutory 75% threshold)`);
  }

  if (consecutiveAbsences >= 3 || attendancePercentage < 75) {
    return {
      riskLevel: 'high',
      consecutiveAbsences,
      attendancePercentage,
      reasons: reasons.length > 0 ? reasons : ['Critical attendance deficit'],
    };
  }

  if (consecutiveAbsences >= 2 || attendancePercentage < 85) {
    if (consecutiveAbsences >= 2) reasons.push(`${consecutiveAbsences} consecutive days absent`);
    if (attendancePercentage < 85) reasons.push(`Borderline attendance (${attendancePercentage.toFixed(1)}%)`);
    return {
      riskLevel: 'medium',
      consecutiveAbsences,
      attendancePercentage,
      reasons,
    };
  }

  return {
    riskLevel: 'low',
    consecutiveAbsences,
    attendancePercentage,
    reasons: ['Normal attendance pattern'],
  };
}

/**
 * Computes consecutive absences for a student up to a given date
 */
export async function getConsecutiveAbsences(studentId: string, currentDate: string): Promise<number> {
  if (!isSupabaseConfigured || !supabase) {
    return 1;
  }

  try {
    const { data: pastRecords, error } = await supabase
      .from('attendance')
      .select('status, date')
      .eq('student_id', studentId)
      .lt('date', currentDate)
      .order('date', { ascending: false })
      .limit(10);

    if (error || !pastRecords) {
      return 1;
    }

    let count = 1; // Current day counts as 1
    for (const rec of pastRecords) {
      if (rec.status === 'absent') {
        count++;
      } else {
        break; // Streak broken by present
      }
    }
    return count;
  } catch (err) {
    console.warn('Error calculating consecutive absences:', err);
    return 1;
  }
}
