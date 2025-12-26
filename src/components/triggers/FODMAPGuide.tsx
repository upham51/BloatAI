import { TRIGGER_CATEGORIES } from '@/types';

export function FODMAPGuide() {
  const fodmapCategories = TRIGGER_CATEGORIES.filter(c => c.id.startsWith('fodmaps'));
  const otherCategories = TRIGGER_CATEGORIES.filter(c => !c.id.startsWith('fodmaps'));

  return (
    <div className="mb-4 space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
      {/* FODMAP Categories */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          FODMAPs
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {fodmapCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30"
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs font-semibold text-foreground flex-1">{cat.displayName}</span>
              <span className="text-[10px] text-muted-foreground">{cat.examples}</span>
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
          {otherCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30"
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs font-semibold text-foreground flex-1">{cat.displayName}</span>
              <span className="text-[10px] text-muted-foreground">{cat.examples}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
