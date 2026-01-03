# 🚨 CRITICAL: Run This SQL First in Lovable's Supabase

## Step 1: Go to Lovable → Supabase → SQL Editor

## Step 2: Copy and paste this ENTIRE script:

```sql
-- ============================================================
-- PART 1: Add Missing Onboarding Columns
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_range TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS biological_sex TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS primary_goal TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bloating_frequency TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medications TEXT[];

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- PART 2: Add Test Mode Column (for free testing accounts)
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS test_mode BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_test_mode ON public.profiles(test_mode);

-- ============================================================
-- PART 3: Mark Your Admin Account as Complete & Test Mode
-- ============================================================

-- Replace 'your-admin-email@example.com' with YOUR actual admin email
UPDATE public.profiles
SET
  onboarding_completed = TRUE,
  test_mode = TRUE,
  onboarding_completed_at = NOW()
WHERE email = 'your-admin-email@example.com';

-- ============================================================
-- PART 4: Create Root Cause Assessments Table
-- ============================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_root_cause_user_id ON public.root_cause_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_root_cause_completed_at ON public.root_cause_assessments(completed_at DESC);

-- ============================================================
-- PART 5: Verify Everything Was Created
-- ============================================================

-- This should return 8 rows showing all onboarding columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'age_range', 'biological_sex', 'primary_goal',
    'bloating_frequency', 'medications',
    'onboarding_completed', 'onboarding_completed_at',
    'test_mode'
  )
ORDER BY column_name;
```

## ⚠️ IMPORTANT: Edit Line 41

**Change this line:**
```sql
WHERE email = 'your-admin-email@example.com';
```

**To your actual admin email**, for example:
```sql
WHERE email = 'admin@gutguardian.com';
```

## Step 3: Click "Run"

You should see:
- Success messages for all ALTER TABLE commands
- 8 rows returned showing all the new columns

---

# How to Create Test Accounts (Free Access)

After running the SQL above, you can mark any account as a test account:

```sql
-- Mark specific user as test account (free access, no payment needed)
UPDATE public.profiles
SET test_mode = TRUE
WHERE email = 'testuser@example.com';
```

Test accounts get:
- ✅ Free access (bypass paywall)
- ✅ All features unlocked
- ✅ Perfect for testing

---

# How to Check If It Worked

```sql
-- Check your admin account
SELECT
  email,
  onboarding_completed,
  test_mode,
  age_range IS NOT NULL as has_onboarding_data
FROM public.profiles
WHERE email = 'your-admin-email@example.com';
```

Should return:
- onboarding_completed: `true`
- test_mode: `true`
- has_onboarding_data: `false` (that's OK for existing accounts)
