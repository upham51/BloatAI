# Onboarding Error Debugging Guide

## Quick Fix: Run This SQL in Lovable's Supabase

1. Go to Lovable → Connect to Supabase → SQL Editor
2. Copy and paste this entire script:

```sql
-- Add missing onboarding columns if they don't exist
-- This is safe to run multiple times (IF NOT EXISTS)

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

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'age_range',
    'biological_sex',
    'primary_goal',
    'bloating_frequency',
    'medications',
    'onboarding_completed',
    'onboarding_completed_at'
  )
ORDER BY column_name;
```

3. Click "Run"
4. You should see 7 rows returned showing all the onboarding columns
5. Try the onboarding again

## Common Errors and Solutions

### Error: "column 'age_range' does not exist"
**Solution:** Run the SQL script above

### Error: "permission denied for table profiles"
**Solution:** Check RLS policies in Supabase:
- Go to Authentication → Policies
- Ensure there's a policy: "Users can update own profile"
- Policy should use: `auth.uid() = id`

### Error: "no rows returned"
**Solution:** The user profile might not exist yet:
```sql
-- Check if your profile exists
SELECT * FROM public.profiles WHERE id = auth.uid();

-- If it doesn't exist, create it:
INSERT INTO public.profiles (id, email, onboarding_completed)
VALUES (auth.uid(), auth.email(), false)
ON CONFLICT (id) DO NOTHING;
```

### Error: "null value in column 'onboarding_completed'"
**Solution:** The onboarding_completed column needs a default:
```sql
ALTER TABLE public.profiles
ALTER COLUMN onboarding_completed
SET DEFAULT false;

-- Update any existing NULL values
UPDATE public.profiles
SET onboarding_completed = false
WHERE onboarding_completed IS NULL;
```

## Check Current State

Run this to see what columns exist:

```sql
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Test Profile Update

Try a simple update to test permissions:

```sql
UPDATE public.profiles
SET display_name = 'Test'
WHERE id = auth.uid();
```

If this fails, there's an RLS/permissions issue.
If this works, try adding one onboarding field at a time.

## Next Steps

After running the SQL:
1. Refresh the Gut Guardian app
2. Clear your browser cache (Ctrl+Shift+Delete)
3. Try onboarding again
4. If still failing, check browser console (F12) for the specific error message
