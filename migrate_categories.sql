-- Run this in your Supabase SQL Editor to migrate existing data
-- This updates all meal entries from old category names to new simplified names

-- Step 1: Update detected_triggers
UPDATE meal_entries
SET detected_triggers = (
  SELECT jsonb_agg(
    jsonb_set(
      trigger,
      '{category}',
      to_jsonb(
        CASE trigger->>'category'
          WHEN 'fodmaps-fructans' THEN 'grains'
          WHEN 'fodmaps-gos' THEN 'beans'
          WHEN 'fodmaps-lactose' THEN 'dairy'
          WHEN 'fodmaps-fructose' THEN 'fruit'
          WHEN 'fodmaps-polyols' THEN 'sweeteners'
          WHEN 'cruciferous' THEN 'veggies'
          WHEN 'high-fat' THEN 'fatty-food'
          WHEN 'refined-sugar' THEN 'sugar'
          ELSE trigger->>'category'
        END
      )
    )
  )
  FROM jsonb_array_elements(detected_triggers) AS trigger
)
WHERE detected_triggers IS NOT NULL AND detected_triggers != '[]'::jsonb;

-- Step 2: Update ingredients (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_entries' AND column_name = 'ingredients'
  ) THEN
    UPDATE meal_entries
    SET ingredients = (
      SELECT jsonb_agg(
        jsonb_set(
          ingredient,
          '{trigger_category}',
          to_jsonb(
            CASE ingredient->>'trigger_category'
              WHEN 'fodmaps-fructans' THEN 'grains'
              WHEN 'fodmaps-gos' THEN 'beans'
              WHEN 'fodmaps-lactose' THEN 'dairy'
              WHEN 'fodmaps-fructose' THEN 'fruit'
              WHEN 'fodmaps-polyols' THEN 'sweeteners'
              WHEN 'cruciferous' THEN 'veggies'
              WHEN 'high-fat' THEN 'fatty-food'
              WHEN 'refined-sugar' THEN 'sugar'
              ELSE ingredient->>'trigger_category'
            END
          )
        )
      )
      FROM jsonb_array_elements(ingredients) AS ingredient
    )
    WHERE ingredients IS NOT NULL AND ingredients != '[]'::jsonb;
  END IF;
END $$;

-- Verify the migration
SELECT
  'Migration Complete!' as status,
  COUNT(*) as total_entries,
  COUNT(CASE WHEN detected_triggers::text LIKE '%fodmaps-%' THEN 1 END) as old_format_remaining
FROM meal_entries;
