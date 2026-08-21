import React, { useState } from 'react';
import { useAIOperations } from '@/hooks/useAIOperations';
import { OperationsHeader } from '@/components/ai-operations/OperationsHeader';
import { OperationsMetrics } from '@/components/ai-operations/OperationsMetrics';
import { AbsenceCaseTable } from '@/components/ai-operations/AbsenceCaseTable';
import { CaseDetailModal } from '@/components/ai-operations/CaseDetailModal';
import { AbsenceCase } from '@/types';
import { placeRealTwilioPhoneCall } from '@/services/voiceCallService';
import { Cpu } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

export function AIOperationsPage() {
  const ops = useAIOperations();
  const [selectedCase, setSelectedCase] = useState<AbsenceCase | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const handleStartRealPhoneCall = async (absenceCase: AbsenceCase) => {
    const parentPhone = absenceCase.student?.parentPhone || '+916303318876';
    const parentName = absenceCase.student?.parentName || 'Guardian';
    const studentName = absenceCase.student?.name || 'Student';

    setToastMessage(`📞 Placing Real Outbound Call to ${parentName} (${parentPhone})...`);
    setIsCalling(true);

    try {
      const result = await placeRealTwilioPhoneCall({
        caseId: absenceCase.id,
        studentId: absenceCase.student?.id || '',
        studentName,
        rollNumber: absenceCase.student?.rollNumber || '',
        parentName,
        parentPhone,
        gender: absenceCase.student?.gender,
      });

      if (result.success) {
        setToastMessage(`✅ Call Dispatched! Mobile phone is ringing via Ravi Kumar.`);
      } else {
        setToastMessage(`Call Notice: ${result.error || 'Check phone number'}`);
      }
    } catch (err: any) {
      setToastMessage(`Call error: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      />

      {/* Header */}
      <OperationsHeader />

      {/* Live Voice AI Agent Banner */}
      <div className="border border-neutral-200 rounded-xl bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              Ravi Kumar — Autonomous Telecall Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-100 text-black border border-neutral-300">
                Active
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cartesia Neural Voice (en-IN) · Deepgram Nova-2 Transcriber · Twilio +1 (949) 738-5095
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-600 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-5">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Response Latency</span>
            <span className="font-bold text-black font-mono">~200ms</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">Language</span>
            <span className="font-bold text-black">Indian English / Telugu</span>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <OperationsMetrics metrics={ops.metrics} />

      {/* Active Absence Cases & Parent Call Dispositions Table */}
      <AbsenceCaseTable
        cases={ops.cases}
        onSelectCase={(c) => setSelectedCase(c)}
        onInitiateLiveCall={handleStartRealPhoneCall}
      />

      {/* Case Detail Modal (Transcripts & NLP Extraction) */}
      <CaseDetailModal
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        absenceCase={selectedCase}
      />
    </div>
  );
}
