import { useState } from 'react';
import { X, Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TRIGGER_CATEGORIES, DetectedTrigger, getTriggerCategory } from '@/types';

interface TriggerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (trigger: DetectedTrigger) => void;
}

export function TriggerSelectorModal({ isOpen, onClose, onAdd }: TriggerSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [specificFood, setSpecificFood] = useState('');

  if (!isOpen) return null;

  const selectedCategoryInfo = getTriggerCategory(selectedCategory);

  const handleAdd = () => {
    if (!selectedCategory) return;
    
    onAdd({
      category: selectedCategory,
      food: specificFood.trim() || '',
      confidence: 100, // Manual entries are 100% confidence
    });
    
    // Reset form
    setSelectedCategory('');
    setSpecificFood('');
    onClose();
  };

  const fodmapCategories = TRIGGER_CATEGORIES.filter(c => c.id.startsWith('fodmaps'));
  const otherCategories = TRIGGER_CATEGORIES.filter(c => !c.id.startsWith('fodmaps'));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-xl border border-border/50 max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">Add Trigger</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">Select trigger category</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Choose a category...</option>
              
              <optgroup label="FODMAPs">
                {fodmapCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                ))}
              </optgroup>
              
              <optgroup label="Other Triggers">
                {otherCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                ))}
              </optgroup>
            </select>

            {/* Show examples when category selected */}
            {selectedCategoryInfo && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 text-primary">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{selectedCategoryInfo.examples}</span>
              </div>
            )}
          </div>

          {/* Specific Food Input */}
          <div className="space-y-2">
            <Label htmlFor="food">Specific food (optional)</Label>
            <Input
              id="food"
              type="text"
              placeholder="e.g., garlic, cheddar cheese"
              value={specificFood}
              onChange={(e) => setSpecificFood(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          <Button
            onClick={handleAdd}
            disabled={!selectedCategory}
            className="w-full"
            variant="sage"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Meal
          </Button>
        </div>
      </div>
    </div>
  );
}
