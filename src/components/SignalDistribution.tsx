import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart3, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { Signal, HourlySignal } from '../lib/types';

interface SignalDistributionProps {
  signals: Signal[];
  loading: boolean;
}

interface HourTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function HourTooltip({ active, payload, label }: HourTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#111116] border border-[#1E1E2E] rounded-lg px-3 py-2 shadow-xl">
      <div className="text-[10px] text-[#64748B] font-mono mb-1">{label}:00 UTC</div>
      <div className="text-sm font-mono font-bold text-[#3B82F6]">{payload[0].value} signals</div>
    </div>
  );
}

export function SignalDistribution({ signals, loading }: SignalDistributionProps) {
  const [hourlyData, setHourlyData] = useState<HourlySignal[]>([]);
  const [bestHour, setBestHour] = useState<number | null>(null);

  useEffect(() => {
    const fetchHourly = async () => {
      try {
        const data = await api.getChartSignals();
        setHourlyData(data);
        if (data.length > 0) {
          const max = data.reduce((prev, curr) => curr.count > prev.count ? curr : prev);
          setBestHour(max.hour);
        }
      } catch (e) {
        console.error('Failed to fetch hourly signals:', e);
      }
    };
    fetchHourly();
  }, []);

  // Calculate UP/DOWN from signals
  const upCount = signals.filter(s => s.direction === 'UP').length;
  const downCount = signals.filter(s => s.direction === 'DOWN').length;
  const total = upCount + downCount;
  const upPct = total > 0 ? ((upCount / total) * 100).toFixed(1) : '0';
  const downPct = total > 0 ? ((downCount / total) * 100).toFixed(1) : '0';

  const pieData = [
    { name: 'UP', value: upCount, color: '#00FF85' },
    { name: 'DOWN', value: downCount, color: '#FF3B3B' },
  ];

  const barData = hourlyData.map(h => ({
    hour: `${String(h.hour).padStart(2, '0')}`,
    count: h.count,
  }));

  if (loading) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-[#1E1E2E] rounded-lg" />
          <div className="h-5 bg-[#1E1E2E] rounded w-40" />
        </div>
        <div className="h-48 bg-[#1E1E2E]/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card border border-[#1E1E2E] rounded-xl p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
          <BarChart3 size={16} className="text-[#3B82F6]" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Signal Distribution</h3>
      </div>

      {/* Donut Chart: UP vs DOWN */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-24 h-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={42}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00FF85]" />
              <span className="text-xs text-[#64748B]">UP</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#00FF85]">{upCount} ({upPct}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B]" />
              <span className="text-xs text-[#64748B]">DOWN</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF3B3B]">{downCount} ({downPct}%)</span>
          </div>
          <div className="pt-1 border-t border-[#1E1E2E]">
            <span className="text-[10px] text-[#64748B]">Total: </span>
            <span className="text-[10px] font-mono font-bold text-[#E2E8F0]">{total}</span>
          </div>
        </div>
      </div>

      {/* Hourly Bar Chart */}
      {barData.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Signals by Hour (UTC)</span>
            {bestHour !== null && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#FBBF24]">
                <Clock size={10} />
                Best: {String(bestHour).padStart(2, '0')}:00
              </div>
            )}
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="hour"
                  stroke="#1E1E2E"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B' }}
                  interval={2}
                />
                <YAxis hide />
                <Tooltip content={<HourTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
