import { useState, useCallback, useEffect } from 'react';
import { AbsenceCase, OperationsMetrics } from '@/types';
import { getActiveAbsenceCases, getTodayOperations } from '@/services/operationsService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useAIOperations() {
  const [cases, setCases] = useState<AbsenceCase[]>([]);
  const [metrics, setMetrics] = useState<OperationsMetrics>({
    absencesDetected: 0,
    callsInProgress: 0,
    callsCompleted: 0,
    followUpsRequired: 0,
    highRiskStudents: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const [liveCases, liveMetrics] = await Promise.all([
        getActiveAbsenceCases(),
        getTodayOperations(),
      ]);
      setCases(liveCases || []);
      if (liveMetrics) setMetrics(liveMetrics);
    } catch (err) {
      console.warn('AI Operations live data error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-sync polling every 10 seconds for real-time responsiveness
    const interval = setInterval(loadData, 10000);

    // Listen for custom call completed event
    const handleCallDone = () => loadData();
    window.addEventListener('campuspulse:call_completed', handleCallDone);

    return () => {
      clearInterval(interval);
      window.removeEventListener('campuspulse:call_completed', handleCallDone);
    };
  }, [loadData]);

  return {
    cases,
    metrics,
    refresh: loadData,
  };
}
