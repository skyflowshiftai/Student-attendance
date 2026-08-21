import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jskmwwyabdmlzfetqbfx.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impza213d3lhYmRtbHpmZXRxYmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzQwNzEsImV4cCI6MjEwMjgxMDA3MX0.vV78c-4cv1MpLYxM34AUFRZfersB0jl7mHY2AYdGh2Y';
const VAPI_API_KEY = process.env.VITE_VAPI_API_KEY || 'f6ca7126-af42-4d10-9034-9a8a1ff30e1a';
const VAPI_PHONE_NUMBER_ID = process.env.VITE_VAPI_PHONE_NUMBER_ID || 'b9216d31-f97b-4df3-a8b2-4cde8ce76aa9';
const VAPI_ASSISTANT_ID = process.env.VITE_VAPI_ASSISTANT_ID || 'e8afec72-129a-467c-9d42-6f45c267edff';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatToE164(phone) {
  let clean = (phone || '').replace(/[^0-9+]/g, '');
  if (!clean.startsWith('+')) {
    if (clean.length === 10) clean = '+91' + clean;
    else if (clean.startsWith('0') && clean.length === 11) clean = '+91' + clean.slice(1);
    else if (clean.startsWith('91') && clean.length === 12) clean = '+' + clean;
    else clean = '+' + clean;
  }
  return clean;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', engine: 'Ravi Kumar AI', gateway: 'active' }));
  }

  if (req.url === '/api/call/outbound' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { caseId, studentId, studentName, parentName, parentPhone, gender } = JSON.parse(body || '{}');
        const formattedPhone = formatToE164(parentPhone);

        if (!formattedPhone || formattedPhone.length < 12) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Invalid phone number' }));
        }

        const isFemale = gender === 'female';
        const childTerm = isFemale ? 'your daughter' : 'your son';
        const pronoun = isFemale ? 'she' : 'he';

        const firstMessage = `Hello! This is Ravi Kumar calling from NSRIT College. Am I speaking with ${parentName || 'the parent'}, guardian of ${childTerm}, ${studentName}?`;

        const vapiRes = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumberId: VAPI_PHONE_NUMBER_ID,
            assistantId: VAPI_ASSISTANT_ID,
            customer: {
              number: formattedPhone,
              name: parentName || 'Guardian',
            },
            assistantOverrides: {
              firstMessage,
              variableValues: {
                student_name: studentName,
                student_gender: gender || 'male',
                child_term: childTerm,
                pronoun: pronoun,
              },
            },
          }),
        });

        const vapiData = await vapiRes.json();

        if (vapiData.id) {
          if (SUPABASE_URL && SUPABASE_KEY) {
            await supabase.from('calls').insert({
              absence_case_id: caseId,
              student_id: studentId,
              retell_call_id: vapiData.id,
              status: 'in-progress',
              duration_seconds: 0,
              duration: 0,
              transcript: `[Call initiated] Ravi Kumar → ${parentName} (${formattedPhone}) for ${childTerm} ${studentName}`,
              analysis: {
                vapi_call_id: vapiData.id,
                parent_phone: formattedPhone,
                student_name: studentName,
                student_gender: gender || 'male',
                parent_name: parentName,
              },
            });

            await supabase.from('absence_cases').update({
              status: 'calling',
              updated_at: new Date().toISOString(),
            }).eq('id', caseId);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, callId: vapiData.id }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: vapiData.message || 'Call initiation failed' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Webhook for Vapi Call Status Updates
  if (req.url === '/api/vapi/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const message = payload.message || payload;

        if (message.type === 'end-of-call-report' || message.status === 'ended') {
          const callId = message.call?.id || message.id;
          const endedReason = (message.endedReason || '').toLowerCase();
          const transcript = message.transcript || message.artifact?.transcript || '';
          const summary = message.summary || message.analysis?.summary || '';
          const durationSeconds = Math.round(message.duration || 0);

          const isNotLifted =
            endedReason.includes('no-answer') ||
            endedReason.includes('not-answer') ||
            endedReason.includes('busy') ||
            endedReason.includes('declined') ||
            (durationSeconds < 8 && !transcript);

          let callStatus = isNotLifted ? 'no_answer' : 'completed';
          let reason = isNotLifted ? 'Call Not Lifted (No Answer)' : (summary || 'Absence verified by parent');
          let reasonCategory = isNotLifted ? 'unreached' : 'personal';

          if (!isNotLifted) {
            const lower = (transcript + ' ' + summary).toLowerCase();
            if (lower.includes('fever') || lower.includes('temperature')) {
              reason = summary || 'Medical Leave — Student has fever reported by parent';
              reasonCategory = 'medical';
            } else if (lower.includes('sick') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('unwell')) {
              reason = summary || 'Medical Leave — Student reported unwell by parent';
              reasonCategory = 'medical';
            } else if (lower.includes('travel') || lower.includes('out of station') || lower.includes('village')) {
              reason = summary || 'Travel / Out of station confirmed by parent';
              reasonCategory = 'travel';
            } else if (lower.includes('marriage') || lower.includes('function') || lower.includes('family')) {
              reason = summary || 'Family Event / Emergency confirmed by parent';
              reasonCategory = 'family';
            }
          }

          await supabase.from('calls').update({
            status: callStatus,
            duration_seconds: durationSeconds,
            duration: durationSeconds,
            transcript: transcript || (isNotLifted ? '[Call Unanswered] Parent did not lift phone.' : 'Call completed.'),
            analysis: {
              custom_analysis_data: {
                absence_reason: reason,
                reason_category: reasonCategory,
                guardian_verified: !isNotLifted,
              }
            },
          }).eq('retell_call_id', callId);

          const { data: callRow } = await supabase.from('calls').select('absence_case_id').eq('retell_call_id', callId).single();
          if (callRow?.absence_case_id) {
            await supabase.from('absence_cases').update({
              status: callStatus,
              reason,
              reason_category: reasonCategory,
              follow_up_required: isNotLifted,
              updated_at: new Date().toISOString(),
            }).eq('id', callRow.absence_case_id);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ received: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Telephony Gateway running on :${PORT}`);
});
