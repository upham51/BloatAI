-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS biological_sex TEXT,
ADD COLUMN IF NOT EXISTS primary_goal TEXT,
ADD COLUMN IF NOT EXISTS bloating_frequency TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create table for root cause assessments
CREATE TABLE public.root_cause_assessments (
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

  -- Store all individual answers as JSONB for flexibility
  individual_answers JSONB NOT NULL,

  -- Metadata
  retake_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on root_cause_assessments
ALTER TABLE public.root_cause_assessments ENABLE ROW LEVEL SECURITY;

-- Root cause assessment policies
CREATE POLICY "Users can view own assessments"
  ON public.root_cause_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.root_cause_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON public.root_cause_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX root_cause_assessments_user_id_idx ON public.root_cause_assessments(user_id);
CREATE INDEX root_cause_assessments_completed_at_idx ON public.root_cause_assessments(completed_at DESC);

-- Create view to get latest assessment per user
CREATE OR REPLACE VIEW public.latest_root_cause_assessment AS
SELECT DISTINCT ON (user_id) *
FROM public.root_cause_assessments
ORDER BY user_id, completed_at DESC;

-- Grant access to the view
ALTER VIEW public.latest_root_cause_assessment OWNER TO postgres;
GRANT SELECT ON public.latest_root_cause_assessment TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view own latest assessment"
  ON public.latest_root_cause_assessment FOR SELECT
  USING (auth.uid() = user_id);
