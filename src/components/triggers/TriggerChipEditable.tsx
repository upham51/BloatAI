import { X } from 'lucide-react';
import { DetectedTrigger, getTriggerCategory } from '@/types';
import { cn } from '@/lib/utils';

interface TriggerChipEditableProps {
  trigger: DetectedTrigger;
  onRemove: () => void;
}

export function TriggerChipEditable({ trigger, onRemove }: TriggerChipEditableProps) {
  const categoryInfo = getTriggerCategory(trigger.category);
  
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderLeft: `4px solid ${categoryInfo?.color || '#7FB069'}` }}
    >
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">
          {categoryInfo?.displayName || trigger.category}
        </span>
        {trigger.food && (
          <span className="text-xs text-muted-foreground truncate">{trigger.food}</span>
        )}
        {trigger.confidence > 0 && (
          <span 
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit"
            style={{ 
              backgroundColor: `${categoryInfo?.color}20` || 'hsl(var(--primary) / 0.1)',
              color: categoryInfo?.color || 'hsl(var(--primary))'
            }}
          >
            {trigger.confidence}% confidence
          </span>
        )}
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
