import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { TRIGGER_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

export function FODMAPGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const fodmapCategories = TRIGGER_CATEGORIES.filter(c => c.id.startsWith('fodmaps'));
  const otherCategories = TRIGGER_CATEGORIES.filter(c => !c.id.startsWith('fodmaps'));

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Common Triggers Quick Guide</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 max-h-80 overflow-y-auto animate-slide-down">
          {/* FODMAP Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              FODMAPs
            </h4>
            <div className="space-y-1.5">
              {fodmapCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                  style={{ borderLeft: `4px solid ${cat.color}` }}
                >
                  <span className="text-sm font-medium text-foreground">{cat.displayName}</span>
                  <span className="text-xs text-muted-foreground text-right">{cat.examples}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Triggers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Other Common Triggers
            </h4>
            <div className="space-y-1.5">
              {otherCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                  style={{ borderLeft: `4px solid ${cat.color}` }}
                >
                  <span className="text-sm font-medium text-foreground">{cat.displayName}</span>
                  <span className="text-xs text-muted-foreground text-right">{cat.examples}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
