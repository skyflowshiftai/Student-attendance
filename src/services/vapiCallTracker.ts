import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { updateCallResult } from './voiceCallService';

const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY || "f6ca7126-af42-4d10-9034-9a8a1ff30e1a";

/**
 * Polls Vapi API after an outbound call to retrieve the live transcript,
 * extract the parent's stated absence reason, and update Supabase.
 */
export function trackVapiCall(vapiCallId: string, caseId: string, maxAttempts = 24, intervalMs = 4000) {
  let attempts = 0;

  console.log(`[VAPI_TRACKER] 🎙️ Started monitoring Vapi Call ${vapiCallId} for parent response...`);

  const interval = setInterval(async () => {
    attempts++;

    try {
      const res = await fetch(`https://api.vapi.ai/call/${vapiCallId}`, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      });

      if (!res.ok) {
        if (attempts >= maxAttempts) clearInterval(interval);
        return;
      }

      const callData = await res.json();
      console.log(`[VAPI_TRACKER] Call ${vapiCallId} status: ${callData.status} (Attempt ${attempts}/${maxAttempts})`);

      if (callData.status === 'ended') {
        clearInterval(interval);

        const transcript = callData.transcript || callData.artifact?.transcript || 'Call completed with parent.';
        const durationSeconds = Math.round(callData.duration || callData.endedReason ? (callData.cost || 45) : 45);
        const summary = callData.summary || callData.analysis?.summary || '';

        // Extract Reason from transcript / summary
        let extractedReason = 'Absence verified by parent';
        let reasonCategory = 'personal';

        const textToAnalyze = (transcript + ' ' + summary).toLowerCase();

        if (textToAnalyze.includes('fever') || textToAnalyze.includes('sick') || textToAnalyze.includes('doctor') || textToAnalyze.includes('hospital') || textToAnalyze.includes('ill') || textToAnalyze.includes('health') || textToAnalyze.includes('medical') || textToAnalyze.includes('headache') || textToAnalyze.includes('pain') || textToAnalyze.includes('unwell')) {
          extractedReason = summary || 'Medical Leave — Student reported unwell/fever by parent';
          reasonCategory = 'medical';
        } else if (textToAnalyze.includes('travel') || textToAnalyze.includes('out of station') || textToAnalyze.includes('village') || textToAnalyze.includes('native') || textToAnalyze.includes('train') || textToAnalyze.includes('flight')) {
          extractedReason = summary || 'Travel / Out of station as confirmed by parent';
          reasonCategory = 'travel';
        } else if (textToAnalyze.includes('function') || textToAnalyze.includes('marriage') || textToAnalyze.includes('event') || textToAnalyze.includes('family') || textToAnalyze.includes('emergency')) {
          extractedReason = summary || 'Family Event / Emergency confirmed by parent';
          reasonCategory = 'family';
        } else if (summary) {
          extractedReason = summary;
        }

        console.log(`[VAPI_TRACKER] 📝 Extracted Parent Reason: "${extractedReason}" (Category: ${reasonCategory})`);

        // Update database with the parent's reason
        await updateCallResult(vapiCallId, {
          status: 'completed',
          durationSeconds: durationSeconds > 0 ? durationSeconds : 45,
          transcript,
          reason: extractedReason,
          reasonCategory,
          followUpRequired: reasonCategory === 'medical' || textToAnalyze.includes('serious'),
        });

        // Broadcast a custom event so the UI refreshes live!
        window.dispatchEvent(new CustomEvent('campuspulse:call_completed', {
          detail: { vapiCallId, caseId, reason: extractedReason, reasonCategory }
        }));
      } else if (callData.status === 'in-progress' || callData.status === 'forwarding') {
        // Still talking, continue polling
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    } catch (err) {
      console.warn('[VAPI_TRACKER] Polling error:', err);
      if (attempts >= maxAttempts) clearInterval(interval);
    }
  }, intervalMs);
}
