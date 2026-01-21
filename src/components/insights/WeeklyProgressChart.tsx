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

    // Filter entries that have bloating ratings
    const completedEntries = entries.filter(e =>
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    // Find the earliest date with data
    const datesWithData = completedEntries.map(e => startOfDay(new Date(e.created_at)));

    if (datesWithData.length === 0) {
      return { chartData: [], trend: 'neutral' as const, avgBloating: 0 };
    }

    // Always show full 7-day week (last 7 days) to ensure Sunday is included
    const daysToShow = 7;

    // Create array of days to display - always show last 7 days
    const displayDays = Array.from({ length: daysToShow }, (_, i) => {
      const date = subDays(today, daysToShow - 1 - i);
      return {
        date,
        dateStr: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
      };
    });

    // First pass: collect actual data for each day
    const rawData = displayDays.map(day => {
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
        hasData: avgBloating !== null,
        count: allDayEntries.length,
      };
    });

    // Second pass: fill in gaps by carrying forward/backward
    // First, find the first day with actual data to use for backward fill
    const firstDataIndex = rawData.findIndex(d => d.hasData);
    const firstValue = firstDataIndex >= 0 ? rawData[firstDataIndex].bloating : null;

    // Fill in data with smart carry-forward/backward logic
    let lastKnownBloating: number | null = firstValue;
    const data = rawData.map((day, index) => {
      if (day.hasData) {
        lastKnownBloating = day.bloating;
        return day;
      } else {
        // If we're before the first data point, use first value (backward fill)
        // Otherwise use last known value (forward fill)
        const bloatingValue = index < firstDataIndex ? firstValue : lastKnownBloating;
        return {
          ...day,
          bloating: bloatingValue,
        };
      }
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
            <span className="font-bold text-primary">{data.bloating}/5{!data.hasData && ' *'}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Meals Logged:</span>
            <span className="font-medium text-foreground">{data.count}</span>
          </div>
          {!data.hasData && (
            <div className="text-xs text-muted-foreground pt-1 border-t border-border/50 mt-2">
              * Estimated from previous day
            </div>
          )}
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
    // Ghost data for empty state visualization
    const ghostData = [
      { day: 'Mon', value: 2.5 },
      { day: 'Tue', value: 2.8 },
      { day: 'Wed', value: 2.2 },
      { day: 'Thu', value: 3.1 },
      { day: 'Fri', value: 2.7 },
      { day: 'Sat', value: 2.0 },
      { day: 'Sun', value: 1.8 },
    ];

    return (
      <div className="premium-card p-6 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-mint/5 via-lavender/5 to-primary/5 animate-gradient" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/10 via-mint/10 to-primary/5">
                  <span className="text-xl animate-gentle-float">🌊</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Your Wellness Canvas</h3>
                <p className="text-[11px] text-muted-foreground">
                  Waiting for your first week of data
                </p>
              </div>
            </div>
          </div>

          {/* Ghost Chart */}
          <div className="relative mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={ghostData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ghostGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.15}
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  opacity={0.4}
                />

                <YAxis
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  opacity={0.4}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#ghostGradient)"
                  opacity={0.5}
                  dot={{
                    r: 4,
                    fill: 'hsl(var(--card))',
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 2,
                    opacity: 0.4,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Pulsing overlay to show it's a preview */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Call to action */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-mint/10 border border-primary/20">
              <span className="text-sm">✨</span>
              <p className="text-sm font-semibold text-primary">
                Track meals to unlock your wellness wave
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your personalized bloating insights will appear here after logging meals for 3 days
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-5 relative overflow-hidden group">
      {/* Ambient glow effect */}
      <div className="absolute -inset-20 bg-gradient-to-br from-mint/5 via-primary/5 to-lavender/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 via-mint/20 to-primary/10 backdrop-blur-sm">
                <span className="text-xl">🌊</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-mint to-primary opacity-20 blur-lg rounded-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                Wellness Wave
                {trend === 'down' && <span className="text-xs">✨</span>}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Your 7-day bloating journey
              </p>
            </div>
          </div>

          {/* Enhanced Weekly Average Badge */}
          <div className="relative">
            <div className="flex flex-col items-end gap-0.5 px-4 py-2 rounded-2xl bg-gradient-to-br from-card via-muted/30 to-card border border-border/50 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black bg-gradient-to-r from-primary to-mint bg-clip-text text-transparent">
                  {avgBloating}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">/5</span>
              </div>
            </div>
            {/* Trend indicator */}
            {trend === 'down' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-mint animate-pulse" />
            )}
          </div>
        </div>

        {/* Chart Container with enhanced styling */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                {/* Enhanced gradients with glow */}
                <linearGradient id="improvingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="hsl(var(--mint))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="worseningGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="hsl(var(--coral))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--coral))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.85} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>

                {/* Comfort zone gradient overlay */}
                <linearGradient id="comfortZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.05} />
                  <stop offset="40%" stopColor="hsl(var(--peach))" stopOpacity={0.03} />
                  <stop offset="60%" stopColor="hsl(var(--mint))" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>

                {/* Glow filter for line */}
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Comfort zone background */}
              <Area
                type="monotone"
                dataKey={() => 5}
                stroke="none"
                fill="url(#comfortZone)"
                fillOpacity={0.3}
              />

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.2}
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={8}
              />

              <YAxis
                domain={[0, 5]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                ticks={[0, 1, 2, 3, 4, 5]}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Main wellness wave area */}
              <Area
                type="monotone"
                dataKey="bloating"
                stroke={getTrendColor()}
                strokeWidth={3}
                fill={`url(#${getTrendGradientId()})`}
                animationDuration={2000}
                animationBegin={300}
                animationEasing="ease-out"
                filter="url(#lineGlow)"
                dot={(props: any) => {
                  if (props.payload.bloating === null) return null;

                  const hasActualData = props.payload.hasData;
                  const color = getTrendColor();

                  return (
                    <g>
                      {/* Outer glow ring */}
                      {hasActualData && (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={8}
                          fill={color}
                          opacity={0.2}
                          className="animate-pulse"
                        />
                      )}
                      {/* Main dot */}
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={hasActualData ? 5 : 3}
                        fill={hasActualData ? color : 'hsl(var(--card))'}
                        strokeWidth={2.5}
                        stroke={color}
                        strokeDasharray={hasActualData ? '0' : '2,2'}
                        opacity={hasActualData ? 1 : 0.5}
                      />
                      {/* Inner highlight */}
                      {hasActualData && (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={2}
                          fill="white"
                          opacity={0.6}
                        />
                      )}
                    </g>
                  );
                }}
                activeDot={{
                  r: 8,
                  fill: getTrendColor(),
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 3,
                }}
                connectNulls={true}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Trend indicator badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-soft">
            {trend === 'down' && (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-mint" />
                <span className="text-2xs font-bold text-mint">Improving</span>
              </>
            )}
            {trend === 'up' && (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-coral" />
                <span className="text-2xs font-bold text-coral">Increasing</span>
              </>
            )}
            {trend === 'neutral' && (
              <>
                <Minus className="w-3.5 h-3.5 text-primary" />
                <span className="text-2xs font-bold text-primary">Steady</span>
              </>
            )}
          </div>
        </div>

        {/* Mini stats footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-2xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Good days: <span className="font-bold text-foreground">{chartData.filter(d => d.hasData && (d.bloating || 0) <= 2).length}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-coral" />
            <span className="text-muted-foreground">Bloated days: <span className="font-bold text-foreground">{chartData.filter(d => d.hasData && (d.bloating || 0) >= 4).length}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
