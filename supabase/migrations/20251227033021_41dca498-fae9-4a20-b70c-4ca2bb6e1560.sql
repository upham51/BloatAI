-- Add new columns for enhanced meal naming and notes
ALTER TABLE public.meal_entries 
ADD COLUMN IF NOT EXISTS meal_emoji TEXT,
ADD COLUMN IF NOT EXISTS meal_title TEXT,
ADD COLUMN IF NOT EXISTS title_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS entry_method TEXT DEFAULT 'photo';

-- Add check constraint for entry_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meal_entries_entry_method_check'
  ) THEN
    ALTER TABLE public.meal_entries 
    ADD CONSTRAINT meal_entries_entry_method_check 
    CHECK (entry_method IN ('photo', 'text'));
  END IF;
END $$;