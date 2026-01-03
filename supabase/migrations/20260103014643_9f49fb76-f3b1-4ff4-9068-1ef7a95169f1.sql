-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_range text,
ADD COLUMN IF NOT EXISTS biological_sex text,
ADD COLUMN IF NOT EXISTS primary_goal text,
ADD COLUMN IF NOT EXISTS bloating_frequency text,
ADD COLUMN IF NOT EXISTS medications text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;