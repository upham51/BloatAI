import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TriggerFrequency } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';

interface TriggerFrequencyChartProps {
  triggers: TriggerFrequency[];
}

export function TriggerFrequencyChart({ triggers }: TriggerFrequencyChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return triggers.slice(0, 5).map(trigger => {
      const categoryInfo = getTriggerCategory(trigger.category);
      return {
        name: categoryInfo?.displayName || trigger.category,
        percentage: trigger.percentage,
        count: trigger.count,
        icon: getIconForTrigger(trigger.category),
        suspicion: trigger.suspicionScore,
        color: categoryInfo?.color || '#8B7FD4',
      };
    });
  }, [triggers]);

  const getBarColor = (suspicion: string) => {
    if (suspicion === 'high') return 'hsl(var(--coral))';
    if (suspicion === 'medium') return 'hsl(var(--peach))';
    return 'hsl(var(--primary))';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="premium-card p-3 border border-primary/20 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <span className="font-semibold text-foreground">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Frequency:</span>
            <span className="font-bold text-primary">{data.percentage}%</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Meals:</span>
            <span className="font-medium text-foreground">{data.count}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Risk:</span>
            <span className={`font-medium ${
              data.suspicion === 'high' ? 'text-coral' :
              data.suspicion === 'medium' ? 'text-peach' :
              'text-primary'
            }`}>
              {data.suspicion === 'high' ? '⚠️ High' :
               data.suspicion === 'medium' ? '🤔 Medium' :
               '✓ Low'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const data = chartData[payload.index];
    if (!data) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-10}
          y={0}
          dy={4}
          textAnchor="end"
          fill="hsl(var(--foreground))"
          fontSize={13}
          fontWeight={500}
        >
          <tspan x={-30} fontSize={18}>{data.icon}</tspan>
          <tspan x={-10} dx={-5}>{payload.value.length > 15 ? payload.value.substring(0, 15) + '...' : payload.value}</tspan>
        </text>
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <p className="text-muted-foreground">No trigger data available yet</p>
      </div>
    );
  }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-lavender/20">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Trigger Frequency</h3>
          <p className="text-xs text-muted-foreground">
            How often each category appears in your meals
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setActiveIndex(state.activeTooltipIndex ?? null);
            } else {
              setActiveIndex(null);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="highRisk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--coral))" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="mediumRisk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--peach))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--peach))" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="lowRisk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
            horizontal={true}
            vertical={false}
          />

          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tick={<CustomYAxisTick />}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          />

          <Bar
            dataKey="percentage"
            radius={[0, 8, 8, 0]}
            animationDuration={1200}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.suspicion === 'high'
                    ? 'url(#highRisk)'
                    : entry.suspicion === 'medium'
                    ? 'url(#mediumRisk)'
                    : 'url(#lowRisk)'
                }
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                style={{
                  filter:
                    activeIndex === index
                      ? 'drop-shadow(0 4px 8px hsl(var(--primary) / 0.3))'
                      : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-coral" />
          <span className="text-muted-foreground">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-peach" />
          <span className="text-muted-foreground">Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Low Risk</span>
        </div>
      </div>
    </div>
  );
}
