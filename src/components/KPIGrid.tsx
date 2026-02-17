import { useMemo } from 'react';
import { Activity, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { KPIs, ChartPoint } from '../lib/types';
import type { LucideIcon } from 'lucide-react';

interface SparkPoint {
  v: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  valueColor?: string;
  sparkline?: SparkPoint[];
  sparkColor?: string;
  progress?: number;
  progressColor?: string;
  severity?: 'low' | 'mid' | 'high';
}

function KPICard({ title, value, subtitle, icon: Icon, iconColor, valueColor, sparkline, sparkColor, progress, progressColor, severity }: KPICardProps) {
  const gradientId = `spark-${title.replace(/\s+/g, '-')}`;

  return (
    <div className="glass-card border border-[#1E1E2E] rounded-xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#2a2a3e] transition-all duration-300">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${iconColor}40, transparent)` }} />

      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${iconColor}10` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>

      <div className="text-2xl lg:text-3xl font-mono font-bold tracking-tight" style={{ color: valueColor || '#E2E8F0' }}>
        {value}
      </div>

      {subtitle && (
        <div className="text-[10px] text-[#64748B] mt-1 font-mono">{subtitle}</div>
      )}

      {/* Mini Sparkline */}
      {sparkline && sparkline.length > 2 && (
        <div className="mt-2.5 h-8 -mx-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor || iconColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor || iconColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor || iconColor}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Progress bar (win rate) */}
      {progress !== undefined && (
        <div className="mt-2.5">
          <div className="h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: progressColor || iconColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Severity indicator (drawdown) */}
      {severity && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: '#00FF85' }} />
            <div className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: severity !== 'low' ? '#FBBF24' : '#1E1E2E' }} />
            <div className="w-1.5 h-3 rounded-sm" style={{ backgroundColor: severity === 'high' ? '#FF3B3B' : '#1E1E2E' }} />
          </div>
          <span className="text-[9px] font-mono uppercase tracking-wider" style={{
            color: severity === 'low' ? '#00FF85' : severity === 'mid' ? '#FBBF24' : '#FF3B3B'
          }}>
            {severity === 'low' ? 'Low Risk' : severity === 'mid' ? 'Medium' : 'High Risk'}
          </span>
        </div>
      )}
    </div>
  );
}

interface KPIsProps {
  data: KPIs | null;
  loading: boolean;
  chartData?: ChartPoint[];
}

export function KPIGrid({ data, loading, chartData }: KPIsProps) {
  const pnlSparkline = useMemo(() => {
    if (!chartData || chartData.length < 3) return undefined;
    return chartData.slice(-24).map(p => ({ v: p.pnl_cumulative }));
  }, [chartData]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card border border-[#1E1E2E] rounded-xl p-4 lg:p-5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="h-3 bg-[#1E1E2E] rounded w-16" />
              <div className="w-8 h-8 bg-[#1E1E2E] rounded-lg" />
            </div>
            <div className="h-8 bg-[#1E1E2E] rounded w-24" />
            <div className="h-3 bg-[#1E1E2E] rounded w-16 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const winRateColor = data.win_rate >= 60 ? '#00FF85' : data.win_rate >= 40 ? '#FBBF24' : '#FF3B3B';

  const totalPnlAbs = Math.abs(data.pnl_total) || 1;
  const drawdownRatio = Math.abs(data.drawdown_max) / totalPnlAbs;
  const drawdownSeverity: 'low' | 'mid' | 'high' = drawdownRatio > 0.75 ? 'high' : drawdownRatio > 0.35 ? 'mid' : 'low';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard
        title="Total Signals"
        value={data.total_signals.toLocaleString()}
        subtitle="signals generated"
        icon={Activity}
        iconColor="#3B82F6"
      />
      <KPICard
        title="Win Rate"
        value={`${data.win_rate.toFixed(1)}%`}
        subtitle={`avg PnL $${data.avg_pnl.toFixed(2)}`}
        icon={TrendingUp}
        iconColor={winRateColor}
        valueColor={winRateColor}
        progress={data.win_rate}
        progressColor={winRateColor}
      />
      <KPICard
        title="PnL Total"
        value={`${data.pnl_total >= 0 ? '+' : ''}$${data.pnl_total.toFixed(2)}`}
        subtitle={`post-fees: $${data.pnl_post_fees.toFixed(2)}`}
        icon={DollarSign}
        iconColor={data.pnl_total >= 0 ? '#00FF85' : '#FF3B3B'}
        valueColor={data.pnl_total >= 0 ? '#00FF85' : '#FF3B3B'}
        sparkline={pnlSparkline}
        sparkColor={data.pnl_total >= 0 ? '#00FF85' : '#FF3B3B'}
      />
      <KPICard
        title="Max Drawdown"
        value={`-$${Math.abs(data.drawdown_max).toFixed(2)}`}
        subtitle="max consecutive loss"
        icon={AlertTriangle}
        iconColor="#FF3B3B"
        valueColor="#FF3B3B"
        severity={drawdownSeverity}
      />
    </div>
  );
}
