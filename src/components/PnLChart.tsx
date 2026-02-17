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
  if (loading) {
    return (
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5 h-80 animate-pulse">
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
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5 h-80 flex items-center justify-center text-[#64748B] font-mono text-sm">
        No chart data available
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }));

  const lastValue = data[data.length - 1]?.pnl_cumulative ?? 0;
  const isPositive = lastValue >= 0;
  const color = isPositive ? '#00FF85' : '#FF3B3B';

  return (
    <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Cumulative PnL</h3>
          </div>
        </div>
        <div className={`text-lg font-mono font-bold ${isPositive ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}`}>
          {isPositive ? '+' : ''}${lastValue.toFixed(2)}
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
