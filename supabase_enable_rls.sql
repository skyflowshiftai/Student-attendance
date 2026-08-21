-- =============================================================================
-- CAMPUSPULSE ROW LEVEL SECURITY (RLS) MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_scores ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public write access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public read access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public write access on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public read access on absence_cases" ON public.absence_cases;
DROP POLICY IF EXISTS "Allow public write access on absence_cases" ON public.absence_cases;
DROP POLICY IF EXISTS "Allow public read access on calls" ON public.calls;
DROP POLICY IF EXISTS "Allow public write access on calls" ON public.calls;

-- 3. Create Permissive Institutional Security Policies for 'students'
CREATE POLICY "Allow public read access on students"
ON public.students FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public write access on students"
ON public.students FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Create Permissive Institutional Security Policies for 'attendance'
CREATE POLICY "Allow public read access on attendance"
ON public.attendance FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public write access on attendance"
ON public.attendance FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. Create Permissive Institutional Security Policies for 'absence_cases'
CREATE POLICY "Allow public read access on absence_cases"
ON public.absence_cases FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public write access on absence_cases"
ON public.absence_cases FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Create Permissive Institutional Security Policies for 'calls'
CREATE POLICY "Allow public read access on calls"
ON public.calls FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public write access on calls"
ON public.calls FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 7. Add Realtime publication safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr
        JOIN pg_publication p ON p.oid = pr.prpubid
        JOIN pg_class c ON c.oid = pr.prrelid
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'calls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr
        JOIN pg_publication p ON p.oid = pr.prpubid
        JOIN pg_class c ON c.oid = pr.prrelid
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'absence_cases'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.absence_cases;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr
        JOIN pg_publication p ON p.oid = pr.prpubid
        JOIN pg_class c ON c.oid = pr.prrelid
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'attendance'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
    END IF;
END $$;
