import { Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getTriggerCategory, DetectedTrigger } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';

interface TriggerInfoModalProps {
  trigger: DetectedTrigger | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TriggerInfoModal({ trigger, isOpen, onClose }: TriggerInfoModalProps) {
  if (!trigger) return null;

  const categoryInfo = getTriggerCategory(trigger.category);
  const icon = getIconForTrigger(trigger.food || trigger.category);

  // Get plain English explanation for each trigger type
  const getPlainEnglishInfo = (categoryId: string) => {
    const info: Record<string, { what: string; why: string; commonFoods: string[] }> = {
      'grains': {
        what: 'Grain-based foods containing fructans (short-chain carbs)',
        why: 'These ferment in your gut, producing gas and bloating',
        commonFoods: ['Wheat bread', 'Pasta', 'Onions', 'Garlic', 'Crackers'],
      },
      'beans': {
        what: 'Legumes containing complex sugars (GOS)',
        why: 'Your body lacks enzymes to break these down, causing gas',
        commonFoods: ['Beans', 'Lentils', 'Chickpeas', 'Soybeans', 'Split peas'],
      },
      'dairy': {
        what: 'All products made from animal milk',
        why: 'Contains lactose and proteins that can irritate the gut',
        commonFoods: ['Milk', 'Cheese', 'Yogurt', 'Ice cream', 'Butter', 'Cream'],
      },
      'fruit': {
        what: 'Fruits high in fructose sugar',
        why: 'Excess fructose draws water into your intestines',
        commonFoods: ['Apples', 'Pears', 'Mango', 'Honey', 'Watermelon', 'Agave'],
      },
      'sweeteners': {
        what: 'Sugar alcohols and artificial sweeteners',
        why: "They're poorly absorbed and pull water into your gut",
        commonFoods: ['Sugar-free gum', 'Peaches', 'Plums', 'Diet candy'],
      },
      'gluten': {
        what: 'Protein found in barley, rye, and related grains',
        why: 'Can cause inflammation and digestive distress in sensitive people',
        commonFoods: ['Barley', 'Rye', 'Beer', 'Malt'],
      },
      'veggies': {
        what: 'Cruciferous and high-fiber vegetables',
        why: 'High in fiber and sulfur compounds that produce gas',
        commonFoods: ['Broccoli', 'Cabbage', 'Brussels sprouts', 'Kale', 'Cauliflower'],
      },
      'fatty-food': {
        what: 'Foods cooked in oil or naturally high in fat',
        why: 'Takes longer to digest, slowing down your whole digestive system',
        commonFoods: ['Fried chicken', 'French fries', 'Fatty meats', 'Greasy burgers'],
      },
      'carbonated': {
        what: 'Beverages with dissolved carbon dioxide',
        why: 'The bubbles release gas directly into your digestive system',
        commonFoods: ['Soda', 'Sparkling water', 'Beer', 'Champagne', 'Energy drinks'],
      },
      'sugar': {
        what: 'Processed sugars with no nutritional value',
        why: 'Feeds bad bacteria in your gut, causing fermentation',
        commonFoods: ['Candy', 'Pastries', 'Cookies', 'Sugary cereals'],
      },
      'alcohol': {
        what: 'Fermented beverages containing ethanol',
        why: 'Irritates gut lining and disrupts digestive enzymes',
        commonFoods: ['Beer', 'Wine', 'Spirits', 'Cocktails', 'Hard seltzers'],
      },
      'processed': {
        what: 'Highly processed packaged foods',
        why: 'Contains additives and preservatives that can irritate the gut',
        commonFoods: ['Packaged snacks', 'Cereals', 'Processed meats', 'Instant meals'],
      },
    };

    return info[categoryId] || {
      what: 'A potential digestive trigger',
      why: 'May cause bloating in sensitive individuals',
      commonFoods: [],
    };
  };

  const plainInfo = getPlainEnglishInfo(trigger.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{icon}</div>
              <DialogTitle className="text-xl font-bold">
                {trigger.food || categoryInfo?.displayName || trigger.category}
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Category Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${categoryInfo?.color}15`,
              color: categoryInfo?.color,
              border: `1px solid ${categoryInfo?.color}30`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryInfo?.color }}
            />
            {categoryInfo?.displayName}
          </div>

          {/* What is it? */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              What is it?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {plainInfo.what}
            </p>
          </div>

          {/* Why does it cause bloating? */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-base">💡</span>
              Why does it cause bloating?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {plainInfo.why}
            </p>
          </div>

          {/* Common foods */}
          {plainInfo.commonFoods.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-base">🍽️</span>
                Commonly found in:
              </h3>
              <div className="flex flex-wrap gap-2">
                {plainInfo.commonFoods.map((food, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-xs rounded-full bg-muted/50 text-foreground border border-border/30"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-sage/10 border border-primary/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">💚 Tip:</span> Try
              eliminating this for 2-3 weeks to see if your symptoms improve. Then
              reintroduce slowly to test your tolerance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
