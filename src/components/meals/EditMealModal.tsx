import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Clock, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MealEntry, DetectedTrigger, getTriggerCategory, TRIGGER_CATEGORIES } from '@/types';
import { useMeals } from '@/contexts/MealContext';
import { useToast } from '@/hooks/use-toast';
import { TriggerSelectorModal } from '@/components/triggers/TriggerSelectorModal';

interface EditMealModalProps {
  entry: MealEntry | null;
  open: boolean;
  onClose: () => void;
}

export function EditMealModal({ entry, open, onClose }: EditMealModalProps) {
  const { updateEntry, deleteEntry } = useMeals();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [triggers, setTriggers] = useState<DetectedTrigger[]>([]);
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when entry changes
  useEffect(() => {
    if (entry) {
      setDescription(entry.meal_description);
      setMealTime(format(new Date(entry.created_at), "yyyy-MM-dd'T'HH:mm"));
      setTriggers(entry.detected_triggers || []);
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;
    
    setIsSaving(true);
    try {
      await updateEntry(entry.id, {
        meal_description: description,
        created_at: new Date(mealTime).toISOString(),
        detected_triggers: triggers,
      });
      
      toast({
        title: 'Entry updated',
        description: 'Your meal has been updated successfully.',
      });
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update the entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    
    try {
      await deleteEntry(entry.id);
      toast({
        title: 'Entry deleted',
        description: 'Your meal has been removed.',
      });
      onClose();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the entry.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTrigger = (index: number) => {
    setTriggers(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTrigger = (trigger: DetectedTrigger) => {
    setTriggers(prev => [...prev, trigger]);
    setTriggerModalOpen(false);
  };

  if (!entry) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              ✏️ Edit Meal
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Photo Preview */}
            {entry.photo_url && (
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={entry.photo_url} 
                  alt="" 
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you eat?"
                className="min-h-[80px] rounded-xl bg-muted/30 border-border/50"
              />
            </div>

            {/* Time Eaten */}
            <div className="space-y-2">
              <Label htmlFor="mealTime" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Eaten
              </Label>
              <Input
                id="mealTime"
                type="datetime-local"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="rounded-xl bg-muted/30 border-border/50"
              />
            </div>

            {/* Triggers */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Detected Triggers</Label>
              
              {triggers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {triggers.map((trigger, i) => {
                    const categoryInfo = getTriggerCategory(trigger.category);
                    return (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 group"
                        style={{
                          backgroundColor: `${categoryInfo?.color}15`,
                          color: categoryInfo?.color,
                          border: `1px solid ${categoryInfo?.color}30`
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: categoryInfo?.color }}
                        />
                        {trigger.food || categoryInfo?.displayName}
                        <button
                          onClick={() => handleRemoveTrigger(i)}
                          className="ml-1 p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No triggers detected</p>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTriggerModalOpen(true)}
                className="rounded-full"
              >
                + Add Trigger
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !description.trim()}
                className="rounded-xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trigger Selector Modal */}
      <TriggerSelectorModal
        isOpen={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        onAdd={handleAddTrigger}
      />
    </>
  );
}
