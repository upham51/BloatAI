import React from 'react';
import { Clock, MoreVertical, Flame, Edit3, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealPhoto } from '@/components/meals/MealPhoto';
import { InlineRating } from '@/components/meals/InlineRating';
import { MealEntry, RATING_LABELS, RATING_EMOJIS, getTriggerCategory } from '@/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getQuickMealTitle(entry: MealEntry) {
  if (entry.custom_title) return entry.custom_title;
  if (entry.meal_title) return entry.meal_title;

  const foods = Array.from(
    new Set((entry.detected_triggers || []).map(t => (t.food || '').trim()).filter(Boolean))
  );

  if (foods.length > 0) {
    return foods.slice(0, 3).join(' \u2022 ');
  }

  const firstSentence = entry.meal_description.split(/[.!?\n]/)[0] || entry.meal_description;
  let s = firstSentence.trim().replace(/^"|"$/g, '');

  s = s
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/^(?:\w+\s+){0,3}(stack|bowl|plate|serving)\s+of\s+/i, '')
    .replace(/^(vibrant|hearty|delicious|generous|beautiful|tall)\s+/i, '');

  s = (s.split(',')[0] || s).trim();

  const words = s.split(/\s+/).filter(Boolean);
  const short = words.slice(0, 4).join(' ');
  return short.length > 0 ? short : 'Meal';
}

export function getMealDisplayTitle(entry: MealEntry) {
  return entry.custom_title || entry.meal_title || getQuickMealTitle(entry);
}

function getCardAccent(rating: number | null) {
  if (!rating) {
    return {
      accent: 'bg-charcoal/60',
      iconBg: 'from-sage to-sage-light',
      borderTint: 'border-charcoal/5',
    };
  }
  if (rating <= 2) {
    return {
      accent: 'bg-gradient-to-br from-forest to-forest-light',
      iconBg: 'from-sage to-sage-light',
      borderTint: 'border-forest/8',
    };
  }
  if (rating === 3) {
    return {
      accent: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconBg: 'from-amber-50 to-orange-50',
      borderTint: 'border-amber-500/8',
    };
  }
  return {
    accent: 'bg-gradient-to-br from-burnt to-burnt-dark',
    iconBg: 'from-rose-50 to-red-50',
    borderTint: 'border-burnt/8',
  };
}

interface EntryCardProps {
  entry: MealEntry;
  userAvg: number;
  onRate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onEditTitle: () => void;
  delay?: number;
  isFirstPhoto?: boolean;
}

export const EntryCard = React.memo(function EntryCard({
  entry,
  userAvg,
  onRate,
  onEdit,
  onDelete,
  onViewDetails,
  onEditTitle,
  delay = 0,
  isFirstPhoto = false,
}: EntryCardProps) {
  const isPending = entry.rating_status === 'pending';
  const rating = entry.bloating_rating;

  const displayTitle = getQuickMealTitle(entry);
  const displayEmoji = entry.meal_emoji || '\uD83C\uDF7D\uFE0F';
  const accent = getCardAccent(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`glass-card overflow-hidden cursor-pointer group ${accent.borderTint}`}
    >
      {/* Rating Indicator Badge */}
      {rating ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-xl ${accent.accent} flex items-center justify-center shadow-md z-10`}
        >
          <div className="flex items-baseline">
            <span className="text-white font-bold text-xs">{rating}</span>
            <span className="text-white/70 font-medium text-[9px]">/5</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-sage backdrop-blur-md z-10"
        >
          <span className="text-[9px] font-bold text-charcoal/50 uppercase tracking-wide">Unrated</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex gap-3.5 p-4" onClick={onViewDetails}>
        {entry.photo_url ? (
          <MealPhoto
            photoUrl={entry.photo_url}
            className="w-16 h-16 rounded-2xl shadow-sm cursor-pointer object-cover flex-shrink-0 ring-1 ring-black/[0.04]"
            priority={isFirstPhoto}
            thumbnail={true}
          />
        ) : (
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.iconBg} flex items-center justify-center cursor-pointer flex-shrink-0`}
          >
            <span className="text-2xl">
              {entry.entry_method === 'text' ? '\u270D\uFE0F' : displayEmoji}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 pr-8">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">{displayEmoji}</span>
            <h3 className="font-bold text-charcoal text-sm truncate leading-tight">
              {displayTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-charcoal/40" />
              <p className="text-[11px] text-charcoal/50 font-medium">
                {format(new Date(entry.created_at), 'h:mm a')}
              </p>
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <span className="text-xs">{RATING_EMOJIS[rating]}</span>
                <span className="text-[11px] font-medium text-charcoal/50">
                  {RATING_LABELS[rating]}
                </span>
              </div>
            )}
          </div>

          {entry.detected_triggers && entry.detected_triggers.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {entry.detected_triggers.slice(0, 2).map((trigger, i) => {
                const categoryInfo = getTriggerCategory(trigger.category);
                return (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[9px] font-semibold rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: `${categoryInfo?.color}15`,
                      color: categoryInfo?.color,
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: categoryInfo?.color }}
                    />
                    {trigger.food || categoryInfo?.displayName?.split(' - ')[1]}
                  </span>
                );
              })}
              {entry.detected_triggers.length > 2 && (
                <span className="text-[9px] font-medium text-charcoal/40">
                  +{entry.detected_triggers.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-3.5 right-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-sage/50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-3.5 h-3.5 text-charcoal/40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-white/50">
            <DropdownMenuItem onClick={onEditTitle} className="rounded-lg font-medium">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="rounded-lg font-medium">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg font-medium">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Inline Rating */}
      {!entry.bloating_rating && isPending && (
        <InlineRating entryId={entry.id} />
      )}
    </motion.div>
  );
});
