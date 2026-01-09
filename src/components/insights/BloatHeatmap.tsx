import { useMemo } from 'react';
import { MealEntry } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';

interface BloatHeatmapProps {
  entries: MealEntry[];
}

export function BloatHeatmap({ entries }: BloatHeatmapProps) {
  const { calendarDays, stats } = useMemo(() => {
    // Get current month
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate daily averages
    const dayAverages: Record<string, { total: number; count: number }> = {};

    entries
      .filter((e) => e.rating_status === 'completed' && e.bloating_rating)
      .forEach((entry) => {
        const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
        if (!dayAverages[dateKey]) {
          dayAverages[dateKey] = { total: 0, count: 0 };
        }
        dayAverages[dateKey].total += entry.bloating_rating!;
        dayAverages[dateKey].count += 1;
      });

    // Map days to bloat levels
    const calendarDays = days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayData = dayAverages[dateKey];
      const avgBloating = dayData
        ? dayData.total / dayData.count
        : null;

      let color = 'bg-muted/20'; // No data
      let label = 'No data';
      let bloatLevel: number | null = null;

      if (avgBloating !== null) {
        bloatLevel = Math.round(avgBloating * 10) / 10;
        if (avgBloating <= 2) {
          color = 'bg-primary/80'; // Green - Good
          label = 'Good day';
        } else if (avgBloating <= 3) {
          color = 'bg-yellow-400'; // Yellow - Moderate
          label = 'Moderate';
        } else {
          color = 'bg-coral'; // Red - Bad
          label = 'Bad day';
        }
      }

      return {
        date: day,
        color,
        label,
        bloatLevel,
        count: dayData?.count || 0,
      };
    });

    // Calculate stats
    const goodDays = calendarDays.filter(
      (d) => d.bloatLevel !== null && d.bloatLevel <= 2
    ).length;
    const badDays = calendarDays.filter(
      (d) => d.bloatLevel !== null && d.bloatLevel >= 4
    ).length;
    const trackedDays = calendarDays.filter((d) => d.bloatLevel !== null).length;

    return {
      calendarDays,
      stats: { goodDays, badDays, trackedDays },
    };
  }, [entries]);

  // Get weekday headers
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate grid start position (offset for first day of month)
  const firstDayOfMonth = calendarDays[0]?.date;
  const gridStartDay = firstDayOfMonth ? firstDayOfMonth.getDay() : 0;

  return (
    <div className="premium-card p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Bloat Calendar - {format(new Date(), 'MMMM yyyy')}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-muted/20 border border-border/50">
          <div className="text-2xl font-bold text-foreground mb-1">
            {stats.trackedDays}
          </div>
          <div className="text-xs text-muted-foreground font-medium">Days tracked</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-primary/15 border border-primary/30">
          <div className="text-2xl font-bold text-primary mb-1">{stats.goodDays}</div>
          <div className="text-xs text-muted-foreground font-medium">Good days</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-coral/15 border border-coral/30">
          <div className="text-2xl font-bold text-coral mb-1">{stats.badDays}</div>
          <div className="text-xs text-muted-foreground font-medium">Bad days</div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-bold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for offset */}
        {Array.from({ length: gridStartDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, i) => {
          const isToday = isSameDay(day.date, new Date());
          return (
            <div
              key={i}
              className={`aspect-square rounded-xl ${day.color} flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105 cursor-pointer group relative shadow-sm ${
                isToday ? 'ring-[3px] ring-foreground ring-offset-2 ring-offset-background' : ''
              }`}
              title={`${format(day.date, 'MMM d')}: ${day.label}${
                day.bloatLevel !== null ? ` (${day.bloatLevel}/5)` : ''
              }`}
            >
              <span
                className={`${
                  day.bloatLevel !== null
                    ? 'text-white font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                {format(day.date, 'd')}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-card border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-xs font-semibold text-foreground mb-1">
                  {format(day.date, 'MMM d')}
                </p>
                {day.bloatLevel !== null ? (
                  <>
                    <p className="text-2xs text-muted-foreground">
                      Avg: {day.bloatLevel}/5
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {day.count} meal{day.count !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-2xs text-muted-foreground">No data</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground text-center">
          Bloating Levels
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
            <div className="w-6 h-6 rounded-md bg-primary/80 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">😊</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">Minimal</p>
              <p className="text-2xs text-muted-foreground leading-tight">Feeling Good</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
            <div className="w-6 h-6 rounded-md bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">😐</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">Moderate</p>
              <p className="text-2xs text-muted-foreground leading-tight">Some Discomfort</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-coral/10 border border-coral/30">
            <div className="w-6 h-6 rounded-md bg-coral flex items-center justify-center flex-shrink-0">
              <span className="text-xs">😣</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">Significant</p>
              <p className="text-2xs text-muted-foreground leading-tight">Uncomfortable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
