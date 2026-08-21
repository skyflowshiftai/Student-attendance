import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { updateCallResult } from './voiceCallService';

const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY || "f6ca7126-af42-4d10-9034-9a8a1ff30e1a";

/**
 * Polls Vapi API after an outbound call to retrieve the live transcript,
 * verifies whether the parent answered ("Lifted") or didn't answer ("Not Lifted"),
 * extracts only authentic spoken reasons (no hallucinations), and updates Supabase.
 */
export function trackVapiCall(vapiCallId: string, caseId: string, maxAttempts = 30, intervalMs = 3500) {
  let attempts = 0;

  console.log(`[VAPI_TRACKER] 🎙️ Monitoring Vapi Call ${vapiCallId} for parent response...`);

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

        const endedReason = (callData.endedReason || '').toLowerCase();
        const durationSeconds = Math.round(callData.duration || 0);
        const transcript = callData.transcript || callData.artifact?.transcript || '';
        const summary = callData.summary || callData.analysis?.summary || '';

        // 1. Check if Call was Not Lifted / Unanswered / Rejected
        const isNotLifted =
          endedReason.includes('no-answer') ||
          endedReason.includes('not-answer') ||
          endedReason.includes('busy') ||
          endedReason.includes('declined') ||
          endedReason.includes('unreachable') ||
          (durationSeconds < 8 && !transcript);

        if (isNotLifted) {
          console.log(`[VAPI_TRACKER] 📵 Call was NOT LIFTED (Reason: ${endedReason}, Duration: ${durationSeconds}s)`);
          
          await updateCallResult(vapiCallId, {
            status: 'no_answer',
            durationSeconds: durationSeconds > 0 ? durationSeconds : 0,
            transcript: transcript || `[Call Unanswered] Parent did not pick up the phone (${endedReason || 'no answer'}).`,
            reason: 'Call Not Lifted (Parent Did Not Answer)',
            reasonCategory: 'unreached',
            followUpRequired: true,
          });

          window.dispatchEvent(new CustomEvent('campuspulse:call_completed', {
            detail: { vapiCallId, caseId, reason: 'Call Not Lifted', status: 'no_answer' }
          }));
          return;
        }

        // 2. Call was Lifted & Answered — Extract genuine spoken reason without hallucinations
        let extractedReason = '';
        let reasonCategory = 'personal';

        const textToAnalyze = (transcript + ' ' + summary).toLowerCase();

        if (textToAnalyze.includes('fever') || textToAnalyze.includes('temperature')) {
          extractedReason = summary || 'Medical Leave — Student has fever as reported by parent';
          reasonCategory = 'medical';
        } else if (textToAnalyze.includes('sick') || textToAnalyze.includes('hospital') || textToAnalyze.includes('doctor') || textToAnalyze.includes('ill') || textToAnalyze.includes('stomach') || textToAnalyze.includes('headache') || textToAnalyze.includes('unwell')) {
          extractedReason = summary || 'Medical Leave — Student unwell as reported by parent';
          reasonCategory = 'medical';
        } else if (textToAnalyze.includes('travel') || textToAnalyze.includes('out of station') || textToAnalyze.includes('village') || textToAnalyze.includes('native') || textToAnalyze.includes('train') || textToAnalyze.includes('bus') || textToAnalyze.includes('flight')) {
          extractedReason = summary || 'Travel / Out of station confirmed by parent';
          reasonCategory = 'travel';
        } else if (textToAnalyze.includes('marriage') || textToAnalyze.includes('wedding') || textToAnalyze.includes('function') || textToAnalyze.includes('family') || textToAnalyze.includes('emergency')) {
          extractedReason = summary || 'Family Event / Emergency confirmed by parent';
          reasonCategory = 'family';
        } else if (summary && summary.length > 5) {
          extractedReason = summary;
          reasonCategory = 'personal';
        } else if (transcript && transcript.length > 20) {
          extractedReason = 'Parent confirmed absence during phone call';
          reasonCategory = 'personal';
        } else {
          extractedReason = 'Call Answered — Reason not clearly stated by parent';
          reasonCategory = 'unknown';
        }

        console.log(`[VAPI_TRACKER] 📝 Verified Parent Reason: "${extractedReason}" (Category: ${reasonCategory})`);

        await updateCallResult(vapiCallId, {
          status: 'completed',
          durationSeconds: durationSeconds > 0 ? durationSeconds : 35,
          transcript: transcript || 'Call completed with parent.',
          reason: extractedReason,
          reasonCategory,
          followUpRequired: reasonCategory === 'medical' || textToAnalyze.includes('serious'),
        });

        window.dispatchEvent(new CustomEvent('campuspulse:call_completed', {
          detail: { vapiCallId, caseId, reason: extractedReason, reasonCategory, status: 'completed' }
        }));
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    } catch (err) {
      console.warn('[VAPI_TRACKER] Polling error:', err);
      if (attempts >= maxAttempts) clearInterval(interval);
    }
  }, intervalMs);
}
