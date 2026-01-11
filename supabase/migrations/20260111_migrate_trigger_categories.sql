-- Migration to update trigger categories from old FODMAP names to simplified names
-- This updates all existing meal entries with the new category IDs

-- Update detected_triggers JSON in meal_entries table
UPDATE meal_entries
SET detected_triggers = (
  SELECT jsonb_agg(
    CASE
      -- FODMAPs - Fructans → Grains
      WHEN trigger->>'category' = 'fodmaps-fructans' THEN
        jsonb_set(trigger, '{category}', '"grains"')

      -- FODMAPs - GOS → Beans
      WHEN trigger->>'category' = 'fodmaps-gos' THEN
        jsonb_set(trigger, '{category}', '"beans"')

      -- FODMAPs - Lactose → Dairy (merge with existing dairy)
      WHEN trigger->>'category' = 'fodmaps-lactose' THEN
        jsonb_set(trigger, '{category}', '"dairy"')

      -- FODMAPs - Fructose → Fruit
      WHEN trigger->>'category' = 'fodmaps-fructose' THEN
        jsonb_set(trigger, '{category}', '"fruit"')

      -- FODMAPs - Polyols → Sweeteners
      WHEN trigger->>'category' = 'fodmaps-polyols' THEN
        jsonb_set(trigger, '{category}', '"sweeteners"')

      -- Cruciferous → Veggies
      WHEN trigger->>'category' = 'cruciferous' THEN
        jsonb_set(trigger, '{category}', '"veggies"')

      -- High-Fat → Fatty Food
      WHEN trigger->>'category' = 'high-fat' THEN
        jsonb_set(trigger, '{category}', '"fatty-food"')

      -- Refined Sugar → Sugar
      WHEN trigger->>'category' = 'refined-sugar' THEN
        jsonb_set(trigger, '{category}', '"sugar"')

      -- Keep existing categories that are already correct
      ELSE trigger
    END
  )
  FROM jsonb_array_elements(detected_triggers) AS trigger
)
WHERE detected_triggers IS NOT NULL
  AND detected_triggers != '[]'::jsonb
  AND (
    detected_triggers::text LIKE '%fodmaps-fructans%' OR
    detected_triggers::text LIKE '%fodmaps-gos%' OR
    detected_triggers::text LIKE '%fodmaps-lactose%' OR
    detected_triggers::text LIKE '%fodmaps-fructose%' OR
    detected_triggers::text LIKE '%fodmaps-polyols%' OR
    detected_triggers::text LIKE '%cruciferous%' OR
    detected_triggers::text LIKE '%high-fat%' OR
    detected_triggers::text LIKE '%refined-sugar%'
  );

-- Update ingredients JSON in meal_entries table (if the column exists)
UPDATE meal_entries
SET ingredients = (
  SELECT jsonb_agg(
    CASE
      -- FODMAPs - Fructans → Grains
      WHEN ingredient->>'trigger_category' = 'fodmaps-fructans' THEN
        jsonb_set(ingredient, '{trigger_category}', '"grains"')

      -- FODMAPs - GOS → Beans
      WHEN ingredient->>'trigger_category' = 'fodmaps-gos' THEN
        jsonb_set(ingredient, '{trigger_category}', '"beans"')

      -- FODMAPs - Lactose → Dairy
      WHEN ingredient->>'trigger_category' = 'fodmaps-lactose' THEN
        jsonb_set(ingredient, '{trigger_category}', '"dairy"')

      -- FODMAPs - Fructose → Fruit
      WHEN ingredient->>'trigger_category' = 'fodmaps-fructose' THEN
        jsonb_set(ingredient, '{trigger_category}', '"fruit"')

      -- FODMAPs - Polyols → Sweeteners
      WHEN ingredient->>'trigger_category' = 'fodmaps-polyols' THEN
        jsonb_set(ingredient, '{trigger_category}', '"sweeteners"')

      -- Cruciferous → Veggies
      WHEN ingredient->>'trigger_category' = 'cruciferous' THEN
        jsonb_set(ingredient, '{trigger_category}', '"veggies"')

      -- High-Fat → Fatty Food
      WHEN ingredient->>'trigger_category' = 'high-fat' THEN
        jsonb_set(ingredient, '{trigger_category}', '"fatty-food"')

      -- Refined Sugar → Sugar
      WHEN ingredient->>'trigger_category' = 'refined-sugar' THEN
        jsonb_set(ingredient, '{trigger_category}', '"sugar"')

      ELSE ingredient
    END
  )
  FROM jsonb_array_elements(ingredients) AS ingredient
)
WHERE ingredients IS NOT NULL
  AND ingredients != '[]'::jsonb
  AND (
    ingredients::text LIKE '%fodmaps-fructans%' OR
    ingredients::text LIKE '%fodmaps-gos%' OR
    ingredients::text LIKE '%fodmaps-lactose%' OR
    ingredients::text LIKE '%fodmaps-fructose%' OR
    ingredients::text LIKE '%fodmaps-polyols%' OR
    ingredients::text LIKE '%cruciferous%' OR
    ingredients::text LIKE '%high-fat%' OR
    ingredients::text LIKE '%refined-sugar%'
  );
