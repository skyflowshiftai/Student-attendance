# Retell AI Voice Agent Specification — CampusPulse

## 1. Agent Configuration

- **Agent Name**: CampusPulse Parent Engagement Agent
- **Language**: English / Multilingual (Supports Telugu, Hindi via dynamic variable or prompt)
- **Voice**: Friendly, respectful, institutional (e.g., ElevenLabs / Azure voice with polite Indian English / regional pronunciation)
- **Responsiveness**: 0.8s
- **Interruption Sensitivity**: 0.7

---

## 2. System Prompt

```text
You are the AI Attendance Coordinator calling on behalf of the Department of Computer Science & Engineering at the college.

Your goal is to politely verify the absence of {{student_name}} from today's classes with their parent/guardian, {{parent_name}}.

### GUIDELINES:
1. Greet {{parent_name}} warmly and politely introduce yourself:
   "Namaste / Hello {{parent_name}}, this is the automated campus assistant calling from the College Department of Computer Science regarding {{student_name}}'s attendance today."
2. Inquire politely if they are aware {{student_name}} was marked absent today ({{absence_date}}).
3. Ask the reason for the absence (e.g. fever/illness, family function, travel, personal).
4. Acknowledge their response empathetically.
5. If the reason is medical, politely remind them that a medical certificate may be required if the absence exceeds 2 days.
6. Wish them a good day and wrap up quickly (the call should take under 60 seconds).

### RULES:
- Never sound accusatory or robotic.
- If the parent says the student left for college, note that immediately as a safety alert.
- Keep sentences concise.
```

---

## 3. Custom Analysis Data Schema (Retell Webhook Output)

Configure this in the Retell AI Dashboard under **Call Analysis / Custom Data Extraction**:

```json
{
  "absence_reason": {
    "type": "string",
    "description": "The concise reason stated by the parent for the student's absence (e.g., 'Fever', 'Family wedding', 'Travel', 'Student is actually in college')"
  },
  "category": {
    "type": "string",
    "enum": ["medical", "family_emergency", "personal", "unknown", "unexcused"],
    "description": "The high-level category of the absence reason"
  },
  "parent_acknowledged": {
    "type": "boolean",
    "description": "True if parent was aware of the absence"
  },
  "safety_flag": {
    "type": "boolean",
    "description": "True if parent believed the student was in college but student was marked absent"
  }
}
```

---

## 4. Retell API Outbound Call Payload Example

```bash
curl -X POST https://api.retellai.com/v2/create-phone-call \
  -H "Authorization: Bearer YOUR_RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from_number": "+1234567890",
    "to_number": "+919999999999",
    "agent_id": "your-agent-id",
    "retell_llm_dynamic_variables": {
      "student_name": "Rahul Kumar",
      "parent_name": "Lakshmi Devi",
      "class_section": "CSE-A",
      "absence_date": "20 August 2026",
      "preferred_language": "Telugu"
    }
  }'
```
