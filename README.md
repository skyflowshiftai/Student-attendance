# 🎓 CampusPulse v2.0 — Autonomous Voice AI Telecall & Attendance Infrastructure

> **Enterprise Autonomous Absence Governance & Real-World Voice Telephony for Educational Institutions.**

CampusPulse solves the critical problem of daily student absenteeism in colleges and universities. When faculty take attendance, absent students automatically enter an autonomous pipeline where **Ravi Kumar (Conversational Voice AI)** places real physical telephone calls to parents over cellular PSTN, conducts human-like two-way conversations in English, extracts absence reasons (Medical, Family, Travel, Personal), and saves structured verification logs directly into **Supabase PostgreSQL** in real time.

---

## 🌟 Key Innovations & Features

* **🎙️ Real-World Outbound Telephony**: Dials physical mobile numbers over Twilio PSTN with ultra-low **200ms latency** powered by **Vapi AI + ElevenLabs Neural Voice** (Will persona with Speaker Boost).
* **👩‍🎓👨‍🎓 Dynamic Gender Speech & Grammar**: Intelligently adapts grammar and pronouns based on student gender (*"guardian of your daughter, Sneha"* vs *"guardian of your son, Sai"*).
* **📵 Anti-Hallucination & "Call Not Lifted" Verification**: Handles unanswered/busy calls cleanly as `Call Not Lifted` and records verbatim parent words rather than assuming fake reasons.
* **📊 Dynamic Database Attendance %**: Calculates real attendance percentage directly from all historical database rows.
* **🛡️ Row Level Security & Institutional Login**: Secured with institutional authentication (`AIcampuspulse` / `AI@9999`) with a password visibility toggle and 0 credential leakage.
* **⚡ PostgreSQL Realtime**: Live WebSocket replication on Supabase tables (`students`, `attendance`, `absence_cases`, `calls`).
* **🎨 Minimalist High-Contrast UI**: Clean Linear/Stripe-inspired monochrome design system built with React 18, TypeScript, and Tailwind CSS.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                   CampusPulse Web App                    │
│      React 18 + TypeScript + Vite + Tailwind CSS         │
└────────────────────────────┬─────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌────────────────────┐        ┌────────────────────┐
    │  Supabase Cloud    │        │  Vapi Voice AI     │
    │  PostgreSQL DB     │        │  ElevenLabs Neural │
    │ (Realtime Sync)    │        │  Deepgram Nova-2   │
    └─────────┬──────────┘        └─────────┬──────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
                 📱 Outbound PSTN Call
             (Physical Mobile Phone Rings)
```

---

## 🚀 How to Run on Another Laptop

### 1. Clone the Repository
```bash
git clone https://github.com/skyflowshiftai/Student-attendance.git
cd Student-attendance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Faculty Login Credentials
* **User / Faculty Name**: `AIcampuspulse`
* **Password**: `AI@9999`

---

## 🌐 Live Production URL
* **Live Web App**: [https://skyflowshiftai.github.io/Student-attendance/](https://skyflowshiftai.github.io/Student-attendance/)
* **GitHub Repo**: [https://github.com/skyflowshiftai/Student-attendance](https://github.com/skyflowshiftai/Student-attendance)

---

## 🗄️ PostgreSQL Database Schema

Run the following SQL in your Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT NOT NULL,
    class_section TEXT NOT NULL,
    gender TEXT DEFAULT 'male',
    parent_name TEXT,
    parent_phone TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'English',
    historical_attendance_pct NUMERIC DEFAULT 85,
    location TEXT DEFAULT 'Visakhapatnam',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    subject TEXT NOT NULL,
    class_section TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_by TEXT DEFAULT 'Faculty',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, subject)
);

CREATE TABLE IF NOT EXISTS public.absence_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'completed', 'no_answer', 'failed')),
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    consecutive_absences INT DEFAULT 1,
    reason TEXT,
    reason_category TEXT,
    ai_recommendation TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    absence_case_id UUID REFERENCES public.absence_cases(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    retell_call_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    duration_seconds INT DEFAULT 0,
    duration INT DEFAULT 0,
    transcript TEXT,
    recording_url TEXT,
    analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
```

---

## 🔒 Security & Row Level Security (RLS)
The database is secured with Row Level Security. See `supabase_enable_rls.sql` for policy configurations.
