import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { getTriggerCategory } from '@/types';

interface SwapRowProps {
  trigger: string;
  alternatives: string[];
  occurrences?: number;
  avgBloating?: number;
  className?: string;
}

export function SwapRow({
  trigger,
  alternatives,
  occurrences,
  avgBloating,
  className,
}: SwapRowProps) {
  const categoryInfo = getTriggerCategory(trigger);
  const displayName = categoryInfo?.displayName || trigger;

  return (
    <div
      className={cn(
        'py-3 border-b border-gray-100 last:border-0',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              Instead of
            </span>
            <span className="text-sm font-semibold text-rose-600">
              {displayName}
            </span>
            {occurrences && avgBloating && (
              <span className="text-xs text-gray-500">
                ({occurrences}× this week, avg {avgBloating.toFixed(1)}/5)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs font-medium text-gray-600">Try:</span>
              {alternatives.map((alt, index) => (
                <React.Fragment key={index}>
                  <span className="text-sm text-emerald-700 font-medium">
                    {alt}
                  </span>
                  {index < alternatives.length - 1 && (
                    <span className="text-gray-400">,</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
