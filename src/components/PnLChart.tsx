import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ChartPoint } from '../lib/types';

interface PnLChartProps {
  data: ChartPoint[];
  loading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const TIME_RANGES = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '48H', hours: 48 },
  { label: '7D', hours: 168 },
  { label: 'ALL', hours: 0 },
] as const;

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const isPositive = value >= 0;

  return (
    <div className="bg-[#111116] border border-[#1E1E2E] rounded-lg px-3 py-2 shadow-xl">
      <div className="text-[10px] text-[#64748B] font-mono mb-1">{label}</div>
      <div className={`text-sm font-mono font-bold ${isPositive ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}`}>
        {isPositive ? '+' : ''}${value.toFixed(2)}
      </div>
    </div>
  );
}

export function PnLChart({ data, loading }: PnLChartProps) {
  const [rangeHours, setRangeHours] = useState(0); // 0 = ALL

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (rangeHours === 0) return data;

    const cutoff = Date.now() - rangeHours * 60 * 60 * 1000;
    return data.filter(p => new Date(p.timestamp).getTime() >= cutoff);
  }, [data, rangeHours]);

  if (loading) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-lg h-80 animate-pulse" style={{ padding: '24px' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#1E1E2E] rounded-lg" />
          <div className="h-5 bg-[#1E1E2E] rounded w-36" />
        </div>
        <div className="h-56 bg-[#1E1E2E]/50 rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-lg h-80 flex flex-col items-center justify-center gap-2" style={{ padding: '24px' }}>
        <TrendingUp size={24} className="text-[#64748B]/40" />
        <span className="text-[#64748B] font-mono text-sm">No chart data available</span>
        <span className="text-[10px] text-[#64748B]/60 font-mono">PnL data will appear after signals are processed</span>
      </div>
    );
  }

  const chartData = filteredData.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }));

  const lastValue = filteredData[filteredData.length - 1]?.pnl_cumulative ?? 0;
  const firstValue = filteredData[0]?.pnl_cumulative ?? 0;
  const periodChange = lastValue - firstValue;
  const isPositive = lastValue >= 0;
  const color = isPositive ? '#00FF85' : '#FF3B3B';

  return (
    <div className="glass-card border border-[#1E1E2E] rounded-lg relative overflow-hidden" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Cumulative PnL</h3>
          </div>
          <div className={`text-lg font-mono font-bold ${isPositive ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}`}>
            {isPositive ? '+' : ''}${lastValue.toFixed(2)}
          </div>
          {rangeHours > 0 && (
            <span className={`text-xs font-mono ${periodChange >= 0 ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}`}>
              ({periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)})
            </span>
          )}
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-0.5 bg-[#0A0A0F] rounded-lg p-0.5 border border-[#1E1E2E]">
          {TIME_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setRangeHours(range.hours)}
              className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-md transition-colors ${
                rangeHours === range.hours
                  ? 'bg-[#1E1E2E] text-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#E2E8F0]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="50%" stopColor={color} stopOpacity={0.08} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E1E2E"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#1E1E2E"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#1E1E2E"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B' }}
              tickFormatter={(value: number) => `$${value.toFixed(0)}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pnl_cumulative"
              stroke={color}
              strokeWidth={2}
              fill="url(#gradientPnL)"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#111116', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
