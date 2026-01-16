import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export function MetricCard({
  value,
  label,
  sublabel,
  change,
  trend,
  className,
}: MetricCardProps) {
  // Determine if change is positive based on context
  // For bloating metrics, down is good (positive), up is bad (negative)
  const isPositive = trend === 'down' || (change !== undefined && change < 0);
  const isNegative = trend === 'up' || (change !== undefined && change > 0);

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 text-center border border-gray-100/50 transition-all duration-200 hover:shadow-sm',
        className
      )}
    >
      <div className="space-y-2">
        <div
          className="text-3xl font-semibold tabular-nums text-gray-900"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </div>

        <div className="text-sm font-medium text-gray-700 tracking-wide">
          {label}
        </div>

        {sublabel && (
          <div className="text-xs text-gray-500">
            {sublabel}
          </div>
        )}

        {change !== undefined && change !== 0 && (
          <div className="flex items-center justify-center gap-1 text-xs font-medium">
            {isPositive && (
              <>
                <ArrowDown className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-600">
                  {Math.abs(change).toFixed(0)}% improvement
                </span>
              </>
            )}
            {isNegative && (
              <>
                <ArrowUp className="h-3 w-3 text-rose-500" />
                <span className="text-rose-500">
                  {Math.abs(change).toFixed(0)}% increase
                </span>
              </>
            )}
            {!isPositive && !isNegative && (
              <>
                <Minus className="h-3 w-3 text-gray-400" />
                <span className="text-gray-500">No change</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
