# CampusPulse — Hackathon Presentation & Demonstration Playbook

## 🎯 30-Second Elevator Pitch
> *"Every morning across Indian engineering colleges, faculty spend 15 minutes taking attendance on paper or ERPs, but what happens to the 4–5 students absent? Nobody follows up until semester exams, leading to detention and parent disputes. **CampusPulse transforms attendance from a passive recording task into an autonomous student engagement infrastructure**. Faculty takes attendance in 10 seconds → CampusPulse AI evaluates risk deterministically → calls parents in regional languages via Retell AI Voice Agents → extracts the real absence reason (medical, travel, family) via NLP → and updates the central dashboard with zero human administrative overhead."*

---

## 🚀 The 90-Second Flawless Demo Flow (For Judges)

### Step 1: Faculty Attendance Portal (The Human Action)
1. Open **[http://localhost:5173/](http://localhost:5173/)** → Navigate to **Attendance**.
2. **Key Talking Point**: *"Notice how fast and institutional this is. All 25 students default to Present. The teacher only taps the few absentees (e.g. Rahul Kumar & Sai Krishna)."*
3. Point out the sticky bottom bar: `2 students marked absent`.
4. Click **Submit Attendance** → Confirm in modal.
5. Point out the transition: *"Attendance is securely stored in Supabase PostgreSQL, and absence cases are automatically initialized."*
6. Click **View AI Operations**.

---

### Step 2: AI Operations Command Center (The Machine Action)
1. **Key Talking Point**: *"This is our mission control. The teacher is done with their job; now the autonomous system takes over."*
2. In the yellow **Demo Mode Controller**, click **Run AI Workflow**.
3. Point to the live screen as it executes:
   - `[02s]` **Absence Detection**: 4 absences flagged.
   - `[06s]` **Risk Analysis**: Rahul Kumar & Sai Krishna flagged as **HIGH RISK** (attendance <75% / consecutive absences).
   - `[10s]` **Retell AI Voice Call**: System initiates regional voice telecall to parent.
   - `[14s]` **NLP Extraction**: Parent verifies absence as **"Fever" (Medical)**.
   - `[18s]` **Case Resolution**: Live table row updates with green badge and verified reason.
4. Click **"Review Case"** on Rahul Kumar to open the **AI Case Investigation Modal** showing parent contact, attendance meter, and recommendation.

---

### Step 3: Executive Dashboard & Call Timestamps (Governance & Auditing)
1. Click **Dashboard** in the sidebar.
2. Scroll to **Daily Student Call Logs & Voice Timestamps**:
   - Show the exact call start time (e.g. `10:02:15 AM`), end time (`10:03:03 AM`), and duration (`48s`).
   - Click **"View"** to show the **Verbatim Call Transcript Modal**.
3. Show the **Section-Wise Absence Queue**:
   - Toggle between `CSE-A`, `CSE-B`, and `ECE-A` tabs to show real-time pending calling queues across departments.

---

### Step 4: Live Proof in Supabase (Technical Credibility)
If a judge asks: *"Is this connected to a real database?"*
1. Switch to your **Supabase Dashboard** tab.
2. Open **`attendance`** table → Show the real timestamped records for today.
3. Open **`absence_cases`** table → Show the recorded cases with `risk_level` and `reason`.

---

## 🏆 Key Architecture Highlights to Mention
- **Deterministic Risk Engine**: Fast, zero-hallucination rule evaluation (<75% attendance or ≥3 consecutive days = High Risk).
- **Serverless Voice Orchestration**: Outbound calls dispatched via Supabase Edge Functions with zero API key exposure in frontend.
- **Multilingual Support**: Telugu, Hindi, and English voice agents.
- **Human-in-the-Loop Safeguards**: Flagged escalations for faculty when parents are unreachable or request meetings.
