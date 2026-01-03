# 🔧 Fix "Error Saving Assessment" - Root Cause Quiz

## Problem
When you complete the Root Cause Quiz, you see: **"Error saving assessment"**

## Root Cause
The `root_cause_assessments` table doesn't exist in your Supabase database yet.

## Solution: Run This SQL in Lovable's Supabase

### Step 1: Go to Lovable → Supabase → SQL Editor

### Step 2: Copy and paste this SQL:

```sql
-- Create Root Cause Assessments Table
CREATE TABLE IF NOT EXISTS public.root_cause_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Scores for each category
  aerophagia_score INTEGER CHECK (aerophagia_score BETWEEN 0 AND 10),
  motility_score INTEGER CHECK (motility_score BETWEEN 0 AND 11),
  dysbiosis_score INTEGER CHECK (dysbiosis_score BETWEEN 0 AND 11),
  brain_gut_score INTEGER CHECK (brain_gut_score BETWEEN 0 AND 14),
  hormonal_score INTEGER CHECK (hormonal_score BETWEEN 0 AND 6),
  structural_score INTEGER CHECK (structural_score BETWEEN 0 AND 10),
  lifestyle_score INTEGER CHECK (lifestyle_score BETWEEN 0 AND 6),

  -- Overall metrics
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Severe')),
  top_causes TEXT[],
  red_flags TEXT[],

  -- AI-generated report
  ai_report_summary TEXT,
  ai_report_action_steps TEXT[],
  ai_report_long_term TEXT[],
  ai_report_medical_consult TEXT,

  -- Store all individual answers as JSONB
  individual_answers JSONB NOT NULL,

  -- Metadata
  retake_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.root_cause_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own assessments"
  ON public.root_cause_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own assessments"
  ON public.root_cause_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_root_cause_user_id ON public.root_cause_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_root_cause_completed_at ON public.root_cause_assessments(completed_at DESC);
```

### Step 3: Click "Run"

You should see success messages for all commands.

---

## Verify It Worked

Run this query to check if the table was created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'root_cause_assessments';
```

Should return 1 row showing `root_cause_assessments`.

---

## Test the Fix

1. Refresh your app
2. Go to Root Cause Quiz
3. Complete the quiz
4. Should see: **"Assessment complete! Your personalized insights are ready."**

---

## If You Still Get Errors

Check the browser console (F12 → Console tab) for detailed error messages and share them for debugging.
