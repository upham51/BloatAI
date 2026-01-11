import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

export default function MigrateCategoriesPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    updated: number;
    skipped: number;
  } | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      // Fetch all meal entries
      const { data: entries, error: fetchError } = await supabase
        .from('meal_entries')
        .select('id, detected_triggers')
        .not('detected_triggers', 'is', null);

      if (fetchError) {
        throw new Error(`Failed to fetch entries: ${fetchError.message}`);
      }

      if (!entries || entries.length === 0) {
        setResult({
          success: true,
          message: 'No entries found to migrate',
          updated: 0,
          skipped: 0,
        });
        setIsRunning(false);
        return;
      }

      let updatedCount = 0;
      let skippedCount = 0;

      for (const entry of entries) {
        const triggers = entry.detected_triggers as Array<{
          category: string;
          food: string;
          confidence: number;
        }>;

        if (!triggers || triggers.length === 0) {
          skippedCount++;
          continue;
        }

        // Check if any triggers need updating
        const needsUpdate = triggers.some((t) => t.category in CATEGORY_MAPPING);

        if (!needsUpdate) {
          skippedCount++;
          continue;
        }

        // Update trigger categories
        const updatedTriggers = triggers.map((trigger) => ({
          ...trigger,
          category: CATEGORY_MAPPING[trigger.category] || trigger.category,
        }));

        // Update the entry
        const { error: updateError } = await supabase
          .from('meal_entries')
          .update({ detected_triggers: updatedTriggers })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`Failed to update entry ${entry.id}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }

      setResult({
        success: true,
        message: 'Migration completed successfully!',
        updated: updatedCount,
        skipped: skippedCount,
      });
    } catch (error) {
      console.error('Migration error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        updated: 0,
        skipped: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Migrate Trigger Categories</CardTitle>
          <CardDescription>
            Update existing meal entries from old FODMAP category names to simplified names
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">This migration will update:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>FODMAPs - Fructans → Grains</li>
              <li>FODMAPs - GOS → Beans</li>
              <li>FODMAPs - Lactose → Dairy</li>
              <li>FODMAPs - Fructose → Fruit</li>
              <li>FODMAPs - Polyols → Sweeteners</li>
              <li>Cruciferous → Veggies</li>
              <li>High-Fat → Fatty Food</li>
              <li>Refined Sugar → Sugar</li>
            </ul>
          </div>

          <Button
            onClick={runMigration}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              'Run Migration'
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="space-y-2">
                <p className="font-semibold">{result.message}</p>
                {result.success && (
                  <div className="text-sm space-y-1">
                    <p>✅ Updated: {result.updated} entries</p>
                    <p>⏭️ Skipped: {result.skipped} entries (already up to date)</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
