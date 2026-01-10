import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { NotesPattern } from '@/lib/insightsAnalysis';

interface BehavioralPatternsChartProps {
  patterns: NotesPattern[];
}

export function BehavioralPatternsChart({ patterns }: BehavioralPatternsChartProps) {
  const chartData = useMemo(() => {
    // Create a complete dataset with all pattern types
    const allPatternTypes = ['stress', 'timing', 'rushing', 'hunger', 'restaurant'] as const;

    return allPatternTypes.map(type => {
      const pattern = patterns.find(p => p.type === type);

      if (!pattern || pattern.count === 0) {
        return {
          category: getLabelForType(type),
          bloatingRate: 0,
          count: 0,
          avgBloating: 0,
        };
      }

      const bloatingRate = pattern.count > 0
        ? (pattern.highBloatingCount / pattern.count) * 100
        : 0;

      return {
        category: pattern.label,
        bloatingRate: Math.round(bloatingRate),
        count: pattern.count,
        avgBloating: pattern.avgBloating,
      };
    });
  }, [patterns]);

  const hasData = patterns.length > 0 && patterns.some(p => p.count > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    if (data.count === 0) return null;

    return (
      <div className="premium-card p-3 border border-lavender/30 shadow-lg">
        <div className="font-semibold text-foreground mb-2">{data.category}</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Bloating Rate:</span>
            <span className="font-bold text-lavender">{data.bloatingRate}%</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Occurrences:</span>
            <span className="font-medium text-foreground">{data.count} meals</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Avg Bloating:</span>
            <span className="font-medium text-foreground">{data.avgBloating}/5</span>
          </div>
        </div>
      </div>
    );
  };

  if (!hasData) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Add notes to your meals to see behavioral patterns
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Try adding context like "stressed", "ate late", or "rushed"
        </p>
      </div>
    );
  }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-lavender/20 to-secondary/20">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Behavioral Patterns</h3>
          <p className="text-xs text-muted-foreground">
            How meal context affects your bloating
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--lavender))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--lavender))" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />

          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 10,
            }}
            tickFormatter={(value) => `${value}%`}
          />

          <Radar
            name="Bloating Rate"
            dataKey="bloatingRate"
            stroke="hsl(var(--lavender))"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            strokeWidth={2}
            animationDuration={3500}
            animationBegin={300}
            dot={{
              r: 4,
              fill: 'hsl(var(--lavender))',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
            }}
            activeDot={{
              r: 6,
              fill: 'hsl(var(--lavender))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
            }}
          />

          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 rounded-xl bg-lavender/5 border border-lavender/20">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-semibold text-foreground">Higher values</span> indicate stronger correlation with bloating
        </p>
      </div>
    </div>
  );
}

function getLabelForType(type: string): string {
  const labels: Record<string, string> = {
    stress: 'Stressed',
    timing: 'Late Eating',
    rushing: 'Rushed',
    hunger: 'Very Hungry',
    restaurant: 'Restaurant',
  };
  return labels[type] || type;
}
