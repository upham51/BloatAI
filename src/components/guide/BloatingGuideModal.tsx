import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { BloatingGuide } from './BloatingGuide';

interface BloatingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BloatingGuideModal({ isOpen, onClose }: BloatingGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0"
        hideCloseButton
      >
        {/* Custom Floating Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm border-2 border-border shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110 hover:rotate-90"
          aria-label="Close guide"
        >
          <X className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* Scrollable Content */}
        <div className="relative">
          {/* Beautiful Header with Gradient */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 via-lavender/20 to-mint/10 backdrop-blur-sm border-b border-border/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <span className="text-2xl">🎈</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  The Complete Guide to Bloating
                </h2>
                <p className="text-sm text-muted-foreground">
                  Everything you need to know about bloating and how to fix it
                </p>
              </div>
            </div>
          </div>

          {/* Guide Content */}
          <div className="p-6">
            <BloatingGuide />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
