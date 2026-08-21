# 🎙️ CampusPulse — 3-Minute Hackathon Winning Script

### Positioning:
> **Autonomous Student Absence Response Infrastructure**  
> *(We aren't automating attendance. We're automating everything that happens after attendance.)*

---

### [0:00–0:20] The Real Problem
> *"A student is absent. Today, faculty across Indian engineering colleges repeat the same manual chore: check the record, call the parent, ask why they are absent, write down the reason, and decide whether faculty intervention is needed. Because it's manual, nobody follows up until semester exams when detention lists are released."*

---

### [0:20–0:45] The Trigger (Show `/#/attendance`)
> *"With CampusPulse, the faculty only marks attendance in 10 seconds. All 25 students default to Present. We mark Rahul Kumar absent and click Submit Attendance. Everything after that is automated."*

---

### [0:45–1:20] The Autonomous Response (Show `/#/ai-operations`)
> *"CampusPulse immediately evaluates historical attendance deterministically. Rahul is flagged for attendance risk because he crossed the mandatory 75% institutional threshold and has 3 consecutive absences. The system automatically initiates parent voice communication."*

---

### [1:20–1:55] Voice & NLP Understanding
> *"The voice agent contacts registered guardian Lakshmi Devi, confirms her identity, and collects the absence reason:*
> 
> **Parent:** *'He has fever today.'*
> 
> *Retell AI analyzes the conversation and posts structured data back to our Supabase Edge Function."*

---

### [1:55–2:25] Decision Support & Transparency (Open Case Investigation)
> *"Notice the result:*
> - **Reason:** *Medical (Fever)*
> - **Guardian Verified:** *Yes*
> - **Follow-up:** *Not required*
> - **Risk:** *High*
> 
> *Notice that AI isn't making a disciplinary decision. It calculates risk deterministically from college policies, handles the phone call, and surfaces a structured recommendation for the faculty."*

---

### [2:25–2:50] The Architecture
> **Attendance Event → Edge Agent → Voice Telecall → NLP Extraction → Decision Support → Faculty Discretion**

---

### [2:50–3:00] Closing Punchline
> *"We aren't automating attendance. We're automating everything that happens after attendance. Thank you!"*
