import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { DetectedTrigger } from '@/types';
import { TriggerChipEditable } from './TriggerChipEditable';
import { TriggerSelectorModal } from './TriggerSelectorModal';

interface DetectedTriggersListProps {
  triggers: DetectedTrigger[];
  onTriggersChange: (triggers: DetectedTrigger[]) => void;
}

export function DetectedTriggersList({ triggers, onTriggersChange }: DetectedTriggersListProps) {
  const [showSelector, setShowSelector] = useState(false);

  const removeTrigger = (index: number) => {
    const updated = triggers.filter((_, i) => i !== index);
    onTriggersChange(updated);
  };

  const addTrigger = (trigger: DetectedTrigger) => {
    // Check for duplicates
    const exists = triggers.some(t => 
      t.category === trigger.category && 
      t.food.toLowerCase() === trigger.food.toLowerCase()
    );
    
    if (!exists) {
      onTriggersChange([...triggers, trigger]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Detected FODMAP Triggers</span>
      </div>

      {/* Trigger list */}
      <div className="space-y-2">
        {triggers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No triggers detected. Add manually if needed.
          </p>
        ) : (
          triggers.map((trigger, index) => (
            <TriggerChipEditable
              key={`${trigger.category}-${trigger.food}-${index}`}
              trigger={trigger}
              onRemove={() => removeTrigger(index)}
            />
          ))
        )}
      </div>

      {/* Add trigger button */}
      <button
        onClick={() => setShowSelector(true)}
        className="flex items-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Add Trigger</span>
      </button>

      {/* Selector modal */}
      <TriggerSelectorModal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onAdd={addTrigger}
      />
    </div>
  );
}
