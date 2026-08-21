import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const VAPI_API_KEY = process.env.VITE_VAPI_API_KEY || '';
const VAPI_PHONE_NUMBER_ID = process.env.VITE_VAPI_PHONE_NUMBER_ID || '';
const VAPI_ASSISTANT_ID = process.env.VITE_VAPI_ASSISTANT_ID || '';

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
        const { caseId, studentId, studentName, parentName, parentPhone } = JSON.parse(body || '{}');
        const formattedPhone = formatToE164(parentPhone);

        if (!formattedPhone || formattedPhone.length < 12) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Invalid phone number' }));
        }

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
              firstMessage: `Hello! This is Ravi Kumar calling from NSRIT College. Am I speaking with ${parentName || 'the parent'}, guardian of ${studentName}?`,
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
              transcript: `[Call initiated] Ravi Kumar → ${parentName} (${formattedPhone}) for ${studentName}`,
              analysis: {
                vapi_call_id: vapiData.id,
                parent_phone: formattedPhone,
                student_name: studentName,
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

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Telephony Gateway running on :${PORT}`);
});
