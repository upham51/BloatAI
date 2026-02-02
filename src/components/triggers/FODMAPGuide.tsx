import { TRIGGER_CATEGORIES } from '@/types';

export function FODMAPGuide() {
  // Primary triggers (food-related)
  const foodTriggers = TRIGGER_CATEGORIES.filter(c =>
    ['veggie-vengeance', 'fruit-fury', 'gluten-gang', 'dairy-drama', 'bad-beef'].includes(c.id)
  );

  // Secondary triggers (lifestyle/additives)
  const otherTriggers = TRIGGER_CATEGORIES.filter(c =>
    ['chemical-chaos', 'grease-gridlock', 'spice-strike', 'bubble-trouble'].includes(c.id)
  );

  return (
    <div className="mb-4 space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
      {/* Food Triggers */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          Food Triggers
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {foodTriggers.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30"
            >
              <span className="text-base flex-shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground">{cat.displayName}</span>
                <p className="text-[10px] text-muted-foreground truncate">{cat.threat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Triggers */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          Other Triggers
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {otherTriggers.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30"
            >
              <span className="text-base flex-shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground">{cat.displayName}</span>
                <p className="text-[10px] text-muted-foreground truncate">{cat.threat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
