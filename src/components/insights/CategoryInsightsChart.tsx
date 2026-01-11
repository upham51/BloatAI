import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TrendingUp, Trophy } from 'lucide-react';
import { MealEntry } from '@/types';
import { TRIGGER_CATEGORIES, getTriggerCategory } from '@/types';

interface CategoryInsightsChartProps {
  entries: MealEntry[];
}

interface CategoryStat {
  id: string;
  displayName: string;
  count: number;
  avgBloating: number;
  color: string;
  maxBloating: number;
  minBloating: number;
}

export function CategoryInsightsChart({ entries }: CategoryInsightsChartProps) {
  const categoryStats = useMemo(() => {
    const completedEntries = entries.filter(e => e.rating_status === 'completed');

    if (completedEntries.length === 0) return [];

    // Calculate stats for each category
    const stats: Record<string, {
      count: number;
      totalBloating: number;
      bloatingScores: number[];
    }> = {};

    completedEntries.forEach(entry => {
      const categorySet = new Set<string>();

      // Track unique categories per meal (not per trigger)
      entry.detected_triggers?.forEach(trigger => {
        categorySet.add(trigger.category);
      });

      // For each unique category in this meal, update stats
      categorySet.forEach(category => {
        if (!stats[category]) {
          stats[category] = { count: 0, totalBloating: 0, bloatingScores: [] };
        }

        stats[category].count++;

        if (entry.bloating_rating !== null && entry.bloating_rating !== undefined) {
          stats[category].totalBloating += entry.bloating_rating;
          stats[category].bloatingScores.push(entry.bloating_rating);
        }
      });
    });

    // Convert to CategoryStat array
    const categoryStatsArray: CategoryStat[] = TRIGGER_CATEGORIES.map(category => {
      const stat = stats[category.id];

      if (!stat || stat.count === 0) {
        return {
          id: category.id,
          displayName: category.displayName,
          count: 0,
          avgBloating: 0,
          color: category.color,
          maxBloating: 0,
          minBloating: 0,
        };
      }

      const avgBloating = stat.totalBloating / stat.bloatingScores.length;
      const maxBloating = Math.max(...stat.bloatingScores);
      const minBloating = Math.min(...stat.bloatingScores);

      return {
        id: category.id,
        displayName: category.displayName,
        count: stat.count,
        avgBloating: Math.round(avgBloating * 10) / 10,
        color: category.color,
        maxBloating,
        minBloating,
      };
    });

    // Sort by a combination of frequency and severity (impact score)
    // Impact score = count * avgBloating (categories that appear often AND cause high bloating)
    return categoryStatsArray
      .filter(stat => stat.count > 0) // Only show categories that have been logged
      .sort((a, b) => {
        const impactA = a.count * a.avgBloating;
        const impactB = b.count * b.avgBloating;
        return impactB - impactA; // Sort descending by impact
      });
  }, [entries]);

  if (categoryStats.length === 0) {
    return null;
  }

  // Top trigger (highest impact)
  const topTrigger = categoryStats[0];

  // Get color based on bloating severity
  const getBloatingColor = (avgBloating: number): string => {
    if (avgBloating >= 4) return '#ef4444'; // red-500 (high)
    if (avgBloating >= 3) return '#f97316'; // orange-500 (medium-high)
    if (avgBloating >= 2) return '#eab308'; // yellow-500 (medium)
    return '#22c55e'; // green-500 (low)
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload as CategoryStat;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-foreground mb-2">{data.displayName}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Times logged:</span>
            <span className="font-bold text-foreground">{data.count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Avg bloating:</span>
            <span className="font-bold" style={{ color: getBloatingColor(data.avgBloating) }}>
              {data.avgBloating.toFixed(1)}/5
            </span>
          </div>
          {data.count > 1 && (
            <div className="flex items-center justify-between gap-4 text-xs pt-1 border-t border-border/50 mt-2">
              <span className="text-muted-foreground">Range:</span>
              <span className="text-muted-foreground">
                {data.minBloating} - {data.maxBloating}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="premium-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-lg">Category Insights</h2>
          <p className="text-xs text-muted-foreground">All food categories ranked by impact</p>
        </div>
      </div>

      {/* Top Trigger Highlight */}
      {topTrigger && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-coral/10 to-peach/10 border border-coral/20">
          <div className="p-2 rounded-lg bg-coral/20">
            <Trophy className="w-4 h-4 text-coral" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground">Top Trigger</p>
            <p className="font-bold text-foreground">{topTrigger.displayName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Impact Score</p>
            <p className="text-lg font-bold" style={{ color: getBloatingColor(topTrigger.avgBloating) }}>
              {topTrigger.count}x · {topTrigger.avgBloating}/5
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryStats}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Times Logged', position: 'bottom', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} />
            <Bar
              dataKey="count"
              radius={[0, 8, 8, 0]}
              animationDuration={3500}
            >
              {categoryStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBloatingColor(entry.avgBloating)}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-muted-foreground">Low (1-2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }} />
          <span className="text-muted-foreground">Medium (2-3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} />
          <span className="text-muted-foreground">Med-High (3-4)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-muted-foreground">High (4-5)</span>
        </div>
      </div>
    </div>
  );
}
