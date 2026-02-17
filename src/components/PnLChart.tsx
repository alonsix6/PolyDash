import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartPoint } from '../lib/types';

interface PnLChartProps {
  data: ChartPoint[];
  loading: boolean;
}

export function PnLChart({ data, loading }: PnLChartProps) {
  if (loading) {
    return (
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 h-80 animate-pulse">
        <div className="h-6 bg-[#1E1E2E] rounded w-40 mb-4"></div>
        <div className="h-full bg-[#1E1E2E] rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 h-80 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }));

  const isPositive = data[data.length - 1]?.pnl_cumulative >= 0;
  const color = isPositive ? '#00FF85' : '#FF3B3B';

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
      <h3 className="text-lg font-mono mb-4">PnL Acumulado</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#4B5563"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#4B5563"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E1E2E',
                border: 'none',
                borderRadius: '8px',
                color: '#E8E8E8',
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area
              type="monotone"
              dataKey="pnl_cumulative"
              stroke={color}
              strokeWidth={2}
              fill="url(#colorPnL)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
