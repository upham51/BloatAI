import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentEmoji: string;
  titleOptions: string[];
  onSave: (title: string) => void;
}

export function EditTitleModal({
  isOpen,
  onClose,
  currentTitle,
  currentEmoji,
  titleOptions,
  onSave,
}: EditTitleModalProps) {
  const [customTitle, setCustomTitle] = useState('');

  const handleSelectOption = (title: string) => {
    onSave(title);
    onClose();
  };

  const handleSaveCustom = () => {
    if (customTitle.trim()) {
      onSave(customTitle.trim());
      setCustomTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-bold">Edit Meal Title</DialogTitle>
        </DialogHeader>

        {/* Current Title Display */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 rounded-2xl bg-muted/30 mb-4">
          <span className="text-3xl">{currentEmoji || '🍽️'}</span>
          <span className="text-lg font-semibold text-foreground">{currentTitle}</span>
        </div>

        {/* Suggested Titles */}
        {titleOptions && titleOptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Suggested titles:
            </p>
            <div className="space-y-2">
              {titleOptions.map((title, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(title)}
                  className={`w-full py-3 px-4 text-left rounded-xl border transition-all duration-200 ${
                    title === currentTitle
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <span className="font-medium">{title}</span>
                  {title === currentTitle && (
                    <Check className="w-4 h-4 inline ml-2 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or create your own</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <Input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value.slice(0, 40))}
            placeholder="e.g., Mom's Famous Pancakes"
            className="flex-1 rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCustom()}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {customTitle.length}/40 characters
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustom}
            disabled={!customTitle.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-sage-dark"
          >
            Save Title
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
