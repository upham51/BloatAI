import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';
import { BloatingGuideModal } from './BloatingGuideModal';

export function BloatingGuide() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">🎈 The Complete Guide to Bloating</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Feeling like you have a balloon in your belly after eating? You're not alone.
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-primary flex-shrink-0" />
          </div>

          {/* Click to view hint */}
          <div className="text-center pt-2">
            <p className="text-sm font-semibold text-primary">Click to open the complete guide →</p>
          </div>
        </div>
      </Card>

      <BloatingGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
