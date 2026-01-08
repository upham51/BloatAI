import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyProgressChartProps {
  entries: MealEntry[];
}

export function WeeklyProgressChart({ entries }: WeeklyProgressChartProps) {
  const { chartData, trend, avgBloating } = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        dateStr: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
      };
    });

    const completedEntries = entries.filter(e => e.rating_status === 'completed' && e.bloating_rating);

    const data = last7Days.map(day => {
      const dayEntries = completedEntries.filter(e =>
        isSameDay(new Date(e.created_at), day.date)
      );

      // Count ALL meals for the day, not just completed ones
      const allDayEntries = entries.filter(e =>
        isSameDay(new Date(e.created_at), day.date)
      );

      const avgBloating = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / dayEntries.length
        : null;

      return {
        day: day.dateStr,
        fullDate: day.fullDate,
        bloating: avgBloating !== null ? Math.round(avgBloating * 10) / 10 : null,
        count: allDayEntries.length, // Use all entries count, not just completed
      };
    });

    // Calculate trend (comparing first half vs second half of week)
    const validData = data.filter(d => d.bloating !== null);
    const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
    const secondHalf = validData.slice(Math.ceil(validData.length / 2));

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + (d.bloating || 0), 0) / firstHalf.length
      : 0;

    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + (d.bloating || 0), 0) / secondHalf.length
      : 0;

    const trendValue = secondHalfAvg - firstHalfAvg;
    const trendDirection: 'up' | 'down' | 'neutral' =
      trendValue > 0.3 ? 'up' :
      trendValue < -0.3 ? 'down' :
      'neutral';

    const overallAvg = validData.length > 0
      ? validData.reduce((sum, d) => sum + (d.bloating || 0), 0) / validData.length
      : 0;

    return {
      chartData: data,
      trend: trendDirection,
      avgBloating: Math.round(overallAvg * 10) / 10,
    };
  }, [entries]);

  const hasData = chartData.some(d => d.bloating !== null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    if (data.bloating === null) return null;

    return (
      <div className="premium-card p-3 border border-primary/20 shadow-lg">
        <div className="font-semibold text-foreground mb-2">{data.fullDate}</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Avg Bloating:</span>
            <span className="font-bold text-primary">{data.bloating}/5</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Meals Logged:</span>
            <span className="font-medium text-foreground">{data.count}</span>
          </div>
        </div>
      </div>
    );
  };

  const getTrendColor = () => {
    if (trend === 'down') return 'hsl(var(--mint))'; // Improving
    if (trend === 'up') return 'hsl(var(--coral))'; // Worsening
    return 'hsl(var(--primary))'; // Neutral
  };

  const getTrendGradientId = () => {
    if (trend === 'down') return 'improvingGradient';
    if (trend === 'up') return 'worseningGradient';
    return 'neutralGradient';
  };

  if (!hasData) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">📈</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Log meals this week to see your progress
        </p>
      </div>
    );
  }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-mint/20">
            <span className="text-xl">📈</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">Weekly Progress</h3>
            <p className="text-xs text-muted-foreground">
              Your bloating trend over 7 days
            </p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
          {trend === 'down' ? (
            <>
              <TrendingDown className="w-4 h-4 text-mint" />
              <span className="text-sm font-semibold text-mint">Improving</span>
            </>
          ) : trend === 'up' ? (
            <>
              <TrendingUp className="w-4 h-4 text-coral" />
              <span className="text-sm font-semibold text-coral">Worsening</span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Stable</span>
            </>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="improvingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--mint))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="worseningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />

          <YAxis
            domain={[0, 5]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="bloating"
            stroke={getTrendColor()}
            strokeWidth={2}
            fill={`url(#${getTrendGradientId()})`}
            animationDuration={1500}
            animationBegin={100}
            dot={{
              r: 4,
              fill: getTrendColor(),
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
            }}
            activeDot={{
              r: 6,
              fill: getTrendColor(),
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
            }}
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/30">
        <span className="text-sm text-muted-foreground">Weekly Average</span>
        <span className="text-lg font-bold text-foreground">{avgBloating}/5</span>
      </div>
    </div>
  );
}
