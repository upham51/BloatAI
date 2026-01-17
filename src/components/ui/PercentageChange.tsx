import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PercentageChangeProps {
  /**
   * Percentage value (e.g., 63 for +63%, -8 for -8%)
   */
  value: number;
  /**
   * Size variant
   * Default: 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Show trend arrow icon
   * Default: true
   */
  showIcon?: boolean;
  /**
   * Show plus sign for positive values
   * Default: true
   */
  showPlusSign?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Whether this is a dark themed component (for immersive UI)
   * Default: false
   */
  dark?: boolean;
}

/**
 * PercentageChange Component
 * Displays percentage change indicators like Sonar app
 * Features:
 * - Color-coded based on value (green/red/gray)
 * - Trend arrows
 * - Glow effects in dark mode
 * - Multiple sizes
 */
export function PercentageChange({
  value,
  size = 'md',
  showIcon = true,
  showPlusSign = true,
  className,
  dark = false,
}: PercentageChangeProps) {
  // Determine if the change is positive, negative, or neutral
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  // Get the appropriate icon
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Color classes based on value
  const getColorClasses = () => {
    if (dark) {
      // Dark theme (Sonar-style)
      if (isPositive) {
        return 'percentage-badge-positive';
      } else if (isNegative) {
        return 'percentage-badge-negative';
      } else {
        return 'percentage-badge-neutral';
      }
    } else {
      // Light theme
      if (isPositive) {
        return 'bg-green-100 text-green-700 border border-green-200';
      } else if (isNegative) {
        return 'bg-red-100 text-red-700 border border-red-200';
      } else {
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      }
    }
  };

  // Format the percentage string
  const formattedValue = `${isPositive && showPlusSign ? '+' : ''}${value}%`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-300',
        sizeClasses[size],
        getColorClasses(),
        className
      )}
    >
      {showIcon && (
        <Icon className={cn('flex-shrink-0', iconSizeClasses[size])} />
      )}
      <span>{formattedValue}</span>
    </span>
  );
}

/**
 * Utility function to calculate percentage change
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change rounded to 0 decimal places
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  const change = ((current - previous) / previous) * 100;
  return Math.round(change);
}
