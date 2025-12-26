-- Add custom_title column to meal_entries for user-editable short titles
ALTER TABLE public.meal_entries 
ADD COLUMN custom_title text DEFAULT NULL;