import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { trackVapiCall } from './vapiCallTracker';

export interface LiveVoiceCallSession {
  caseId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  gender?: 'male' | 'female' | 'other';
}

function formatToE164(phone: string): string {
  let clean = phone.replace(/[^0-9+]/g, "");
  if (!clean.startsWith("+")) {
    if (clean.length === 10) clean = "+91" + clean;
    else if (clean.startsWith("0") && clean.length === 11) clean = "+91" + clean.slice(1);
    else if (clean.startsWith("91") && clean.length === 12) clean = "+" + clean;
    else clean = "+" + clean;
  }
  return clean;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const VAPI_API_KEY = import.meta.env.VITE_VAPI_API_KEY || "f6ca7126-af42-4d10-9034-9a8a1ff30e1a";
const VAPI_PHONE_NUMBER_ID = import.meta.env.VITE_VAPI_PHONE_NUMBER_ID || "b9216d31-f97b-4df3-a8b2-4cde8ce76aa9";
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || "e8afec72-129a-467c-9d42-6f45c267edff";

/**
 * Places a Real-World Outbound Telephony Call to a Parent with Gender-Aware Personalization.
 */
export async function placeRealTwilioPhoneCall(
  session: LiveVoiceCallSession
): Promise<{ success: boolean; callSid?: string; error?: string }> {
  try {
    const formattedTo = formatToE164(session.parentPhone);

    if (!formattedTo || formattedTo.length < 12) {
      return { success: false, error: `Invalid phone number: ${session.parentPhone}` };
    }

    const childTerm = session.gender === 'female' ? 'your daughter' : session.gender === 'male' ? 'your son' : 'your child';
    const pronounSubject = session.gender === 'female' ? 'she' : session.gender === 'male' ? 'he' : 'they';
    const firstMessage = `Hello! This is Ravi Kumar calling from NSRIT College. Am I speaking with ${session.parentName || 'the parent'}, guardian of ${childTerm}, ${session.studentName}?`;

    // 1. Try Secure Backend Gateway first
    try {
      const serverRes = await fetch(`${BACKEND_API_URL}/api/call/outbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: session.caseId,
          studentId: session.studentId,
          studentName: session.studentName,
          parentName: session.parentName,
          parentPhone: formattedTo,
          gender: session.gender,
        }),
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.success && serverData.callId) {
          trackVapiCall(serverData.callId, session.caseId);
          return { success: true, callSid: serverData.callId };
        }
      }
    } catch (backendErr) {
      console.info('[TELEPHONY] Gateway offline, switching to direct Vapi channel...');
    }

    // 2. Direct Vapi Channel (Gender-Aware Fallback)
    const res = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        assistantId: VAPI_ASSISTANT_ID,
        customer: {
          number: formattedTo,
          name: session.parentName || "Guardian",
        },
        assistantOverrides: {
          firstMessage,
          variableValues: {
            student_name: session.studentName,
            student_gender: session.gender || 'male',
            child_term: childTerm,
            pronoun: pronounSubject,
          },
        },
      }),
    });

    const data = await res.json();

    if (data.id) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('calls').insert({
          absence_case_id: session.caseId,
          student_id: session.studentId,
          retell_call_id: data.id,
          status: 'in-progress',
          duration_seconds: 0,
          duration: 0,
          transcript: `[Call initiated] Ravi Kumar → ${session.parentName} (${formattedTo}) for ${childTerm} ${session.studentName}`,
          analysis: {
            vapi_call_id: data.id,
            parent_phone: formattedTo,
            student_name: session.studentName,
            student_gender: session.gender || 'male',
            parent_name: session.parentName,
          },
        });

        await supabase.from('absence_cases').update({
          status: 'calling',
          updated_at: new Date().toISOString(),
        }).eq('id', session.caseId);

        trackVapiCall(data.id, session.caseId);
      }

      return { success: true, callSid: data.id };
    }

    return { success: false, error: data.message || "Failed to initiate call" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates call and absence records when Vapi finishes the call.
 */
export async function updateCallResult(
  vapiCallId: string,
  result: {
    status: string;
    durationSeconds: number;
    transcript: string;
    reason?: string;
    reasonCategory?: string;
    followUpRequired?: boolean;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    await supabase
      .from('calls')
      .update({
        status: result.status,
        duration_seconds: result.durationSeconds,
        duration: result.durationSeconds,
        transcript: result.transcript,
        analysis: {
          custom_analysis_data: {
            absence_reason: result.reason || 'Pending verification',
            reason_category: result.reasonCategory || 'unknown',
            guardian_verified: result.status === 'completed',
            follow_up_required: result.followUpRequired || false,
          }
        },
      })
      .eq('retell_call_id', vapiCallId);

    if (result.reason) {
      const { data: callData } = await supabase
        .from('calls')
        .select('absence_case_id')
        .eq('retell_call_id', vapiCallId)
        .single();

      if (callData?.absence_case_id) {
        await supabase.from('absence_cases').update({
          status: result.status === 'completed' ? 'completed' : 'failed',
          reason: result.reason,
          reason_category: result.reasonCategory || 'unknown',
          follow_up_required: result.followUpRequired || false,
          updated_at: new Date().toISOString(),
        }).eq('id', callData.absence_case_id);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to update call result:', err);
    return false;
  }
}
