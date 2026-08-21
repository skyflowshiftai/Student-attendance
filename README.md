# ⚡ CampusPulse — Autonomous Voice AI Telecall Infrastructure

> **Enterprise Autonomous Absence Governance & Real-World Voice Telephony for Educational Institutions.**

CampusPulse solves the critical problem of daily student absenteeism in colleges. When faculty take attendance, absent students automatically enter an autonomous queue where **Ravi Kumar (Conversational Voice AI)** places real physical telephone calls to parents over PSTN, conducts human-like two-way conversations in Indian English / Telugu, extracts absence reasons (Medical, Family, Travel, Personal), and saves the structured logs directly into **Supabase PostgreSQL** in real time.

---

## 🌟 Key Features

* **🎙️ Real-World Outbound Telephony**: Dials physical mobile numbers over Twilio PSTN with ultra-low **200ms latency** powered by **Vapi AI + Cartesia Neural Voice**.
* **🗣️ Native Accent Recognition**: Uses **Deepgram Nova-2 (`en-IN`)** speech-to-text with boost keywords for medical, family, and leave vocabulary.
* **🧠 Automatic NLP Reason Extraction**: Listens to parent responses, classifies absence reasons, and flags high-risk students for faculty review.
* **⚡ PostgreSQL Realtime**: Live WebSocket replication on Supabase tables (`students`, `attendance`, `absence_cases`, `calls`, `risk_scores`).
* **📊 Institutional Dashboard**: Animated metric counters, daily student call logs with timestamps, and section absence queues.
* **🎨 Minimalist High-Contrast UI**: Clean Linear/Stripe-inspired monochrome design system built with React 18, TypeScript, and Tailwind CSS.
* **🔒 Zero-Dependency Telephony Gateway**: Standalone Node HTTP proxy (`backend/server.mjs`) with automatic client failover.

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
    │  PostgreSQL DB     │        │  Cartesia Neural   │
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

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/campus-pulse.git
cd campus-pulse
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPI_API_KEY=your-vapi-key
VITE_VAPI_PHONE_NUMBER_ID=your-vapi-phone-id
VITE_VAPI_ASSISTANT_ID=your-vapi-assistant-id
VITE_TWILIO_PHONE_NUMBER=+19497385095
```

### 3. Run Locally
```bash
# Start Vite Development Server
npm run dev

# (Optional) Start Telephony Gateway
node backend/server.mjs
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Schema (Supabase SQL)

Run the following SQL in your Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT NOT NULL,
    class_section TEXT NOT NULL,
    parent_name TEXT,
    parent_phone TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'Telugu',
    historical_attendance_pct NUMERIC DEFAULT 85,
    location TEXT DEFAULT 'Visakhapatnam',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    subject TEXT NOT NULL,
    marked_by TEXT DEFAULT 'Faculty',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, subject)
);

CREATE TABLE IF NOT EXISTS public.absence_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES public.attendance(id),
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    reason_category TEXT,
    risk_level TEXT DEFAULT 'low',
    consecutive_absences INT DEFAULT 1,
    follow_up_required BOOLEAN DEFAULT FALSE,
    ai_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    absence_case_id UUID REFERENCES public.absence_cases(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id),
    retell_call_id TEXT,
    status TEXT DEFAULT 'in-progress',
    duration INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    transcript TEXT,
    analysis JSONB,
    parent_sentiment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime & Performance Indexes
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.absence_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_calls_student ON public.calls(student_id);
```

---

## 👥 Authors & Acknowledgments

Built for **Autonomous AI Infrastructure & Real-World Telephony** using:
* **Vapi AI & Cartesia** for Conversational Voice AI
* **Deepgram Nova-2** for Indian English Speech-to-Text
* **Supabase** for Realtime PostgreSQL Backend
* **Twilio** for Outbound PSTN Telephony

---

## 📄 License
MIT License. Open-source and ready for production deployment.
