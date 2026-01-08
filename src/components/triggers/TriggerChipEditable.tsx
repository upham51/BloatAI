import { X } from 'lucide-react';
import { DetectedTrigger, getTriggerCategory } from '@/types';
import { getIconForTrigger, abbreviateIngredient } from '@/lib/triggerUtils';

interface TriggerChipEditableProps {
  trigger: DetectedTrigger;
  onRemove: () => void;
}

export function TriggerChipEditable({ trigger, onRemove }: TriggerChipEditableProps) {
  const categoryInfo = getTriggerCategory(trigger.category);
  const icon = getIconForTrigger(trigger.food || trigger.category);
  const displayName = trigger.food 
    ? abbreviateIngredient(trigger.food) 
    : categoryInfo?.displayName || trigger.category;
  
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 transition-all duration-200 hover:-translate-y-0.5"
      style={{ 
        boxShadow: '0 4px 12px -2px hsl(var(--foreground) / 0.08), 0 2px 6px -2px hsl(var(--foreground) / 0.04)'
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Emoji Icon */}
        <span className="text-2xl flex-shrink-0">{icon}</span>
        
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {displayName}
          </span>
          {trigger.food && (
            <span className="text-xs text-muted-foreground truncate">
              {categoryInfo?.displayName || trigger.category}
            </span>
          )}
          {trigger.confidence > 0 && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit"
              style={{
                backgroundColor: categoryInfo?.color ? `${categoryInfo.color}20` : 'hsl(var(--primary) / 0.1)',
                color: categoryInfo?.color || 'hsl(var(--primary))'
              }}
            >
              {trigger.confidence}% confidence
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-90 ml-2 flex-shrink-0"
        aria-label="Remove trigger"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
