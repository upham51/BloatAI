import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PercentageChange } from './PercentageChange';

interface MetricDetail {
  label: string;
  value: string | number;
  percentageChange?: number;
}

interface MetricCardEnhancedProps {
  /**
   * Card title
   */
  title: string;
  /**
   * Main metric value (large display)
   */
  value: string | number;
  /**
   * Unit for the metric (e.g., '%', 'days', 'meals')
   */
  unit?: string;
  /**
   * Icon to display
   */
  icon?: LucideIcon;
  /**
   * Percentage change from previous period
   */
  percentageChange?: number;
  /**
   * Additional metric details (time, efficiency, etc.)
   */
  details?: MetricDetail[];
  /**
   * Progress bar value (0-100)
   */
  progressValue?: number;
  /**
   * Whether to show glow effect
   * Default: false
   */
  glow?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Custom children to render below metrics
   */
  children?: ReactNode;
}

/**
 * MetricCardEnhanced Component
 * Sonar-inspired metric card with dark glassmorphic design
 * Features:
 * - Large metric display
 * - Percentage change indicators
 * - Supporting details (time, efficiency, etc.)
 * - Optional progress bars
 * - Glassmorphic dark theme
 * - Glow effects
 */
export function MetricCardEnhanced({
  title,
  value,
  unit,
  icon: Icon,
  percentageChange,
  details,
  progressValue,
  glow = false,
  className,
  onClick,
  children,
}: MetricCardEnhancedProps) {
  return (
    <div
      className={cn(
        'dark-immersive-card p-5 transition-all duration-300',
        glow && 'dark-metric-card-glow',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-white/5">
              <Icon className="w-4 h-4 text-white/60" />
            </div>
          )}
          <h3 className="text-sm font-medium text-white/70 dark-text-shadow">
            {title}
          </h3>
        </div>
        {percentageChange !== undefined && (
          <PercentageChange value={percentageChange} size="sm" dark />
        )}
      </div>

      {/* Main Metric */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-5xl font-bold text-white dark-text-shadow',
              percentageChange !== undefined &&
                (percentageChange > 0
                  ? 'metric-glow-positive'
                  : percentageChange < 0
                  ? 'metric-glow-negative'
                  : 'metric-glow-neutral')
            )}
          >
            {value}
          </span>
          {unit && (
            <span className="text-2xl font-medium text-white/50 dark-text-shadow">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progressValue !== undefined && (
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 progress-bar-glow transition-all duration-500"
              style={{ width: `${Math.min(progressValue, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Details Grid */}
      {details && details.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {details.map((detail, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
            >
              <div className="text-xs text-white/50 mb-1">{detail.label}</div>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-white dark-text-shadow">
                  {detail.value}
                </span>
                {detail.percentageChange !== undefined && (
                  <PercentageChange
                    value={detail.percentageChange}
                    size="sm"
                    dark
                    showIcon={false}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Children */}
      {children}
    </div>
  );
}
