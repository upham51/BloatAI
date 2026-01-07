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
    <div className="premium-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-lavender/40 to-sky/40">
          <span className="text-xl">📅</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Bloat Calendar</h3>
          <p className="text-xs text-muted-foreground">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-muted/20">
          <div className="text-xl font-bold text-foreground">
            {stats.trackedDays}
          </div>
          <div className="text-2xs text-muted-foreground">Days tracked</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-primary/15">
          <div className="text-xl font-bold text-primary">{stats.goodDays}</div>
          <div className="text-2xs text-muted-foreground">Good days</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-coral/15">
          <div className="text-xl font-bold text-coral">{stats.badDays}</div>
          <div className="text-2xs text-muted-foreground">Bad days</div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-semibold text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
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
              className={`aspect-square rounded-lg ${day.color} flex flex-col items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer group relative ${
                isToday ? 'ring-2 ring-foreground ring-offset-1' : ''
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-card border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-2xs font-semibold text-foreground">
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
      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
        <span className="text-muted-foreground">Less bloating</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-muted/20" />
          <div className="w-4 h-4 rounded bg-primary/80" />
          <div className="w-4 h-4 rounded bg-yellow-400" />
          <div className="w-4 h-4 rounded bg-coral" />
        </div>
        <span className="text-muted-foreground">More bloating</span>
      </div>
    </div>
  );
}
