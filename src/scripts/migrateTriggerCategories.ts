import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// This script migrates existing trigger categories from old FODMAP names to simplified names
// Run this once to update all existing data in your database

// Load environment variables from .env file
const envPath = resolve(process.cwd(), '.env');
const envFile = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORY_MAPPING: Record<string, string> = {
  'fodmaps-fructans': 'grains',
  'fodmaps-gos': 'beans',
  'fodmaps-lactose': 'dairy',
  'fodmaps-fructose': 'fruit',
  'fodmaps-polyols': 'sweeteners',
  'cruciferous': 'veggies',
  'high-fat': 'fatty-food',
  'refined-sugar': 'sugar',
};

async function migrateTriggerCategories() {
  console.log('🚀 Starting trigger category migration...\n');

  try {
    // Fetch all meal entries with old category names
    const { data: entries, error: fetchError } = await supabase
      .from('meal_entries')
      .select('id, detected_triggers')
      .not('detected_triggers', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch entries: ${fetchError.message}`);
    }

    if (!entries || entries.length === 0) {
      console.log('✅ No entries found to migrate');
      return;
    }

    console.log(`📊 Found ${entries.length} entries to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const entry of entries) {
      const triggers = entry.detected_triggers as Array<{ category: string; food: string; confidence: number }>;

      if (!triggers || triggers.length === 0) {
        skippedCount++;
        continue;
      }

      // Check if any triggers need updating
      const needsUpdate = triggers.some(t => t.category in CATEGORY_MAPPING);

      if (!needsUpdate) {
        skippedCount++;
        continue;
      }

      // Update trigger categories
      const updatedTriggers = triggers.map(trigger => ({
        ...trigger,
        category: CATEGORY_MAPPING[trigger.category] || trigger.category,
      }));

      // Update the entry
      const { error: updateError } = await supabase
        .from('meal_entries')
        .update({ detected_triggers: updatedTriggers })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`❌ Failed to update entry ${entry.id}:`, updateError.message);
      } else {
        updatedCount++;
        const oldCategories = triggers.map(t => t.category).join(', ');
        const newCategories = updatedTriggers.map(t => t.category).join(', ');
        console.log(`✅ Updated entry ${entry.id}: ${oldCategories} → ${newCategories}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} entries`);
    console.log(`   ⏭️  Skipped: ${skippedCount} entries (already up to date)`);
    console.log('\n🎉 Migration complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateTriggerCategories()
  .then(() => {
    console.log('✨ All done! Your trigger categories have been updated.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });
