import { Activity, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import type { KPIs } from '../lib/types';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  valueColor?: string;
}

function KPICard({ title, value, subtitle, icon: Icon, iconColor, valueColor }: KPICardProps) {
  return (
    <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-4 lg:p-5 relative overflow-hidden group hover:border-[#2a2a3e] transition-colors duration-200">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${iconColor}40, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${iconColor}10` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>

      <div
        className="text-2xl lg:text-3xl font-mono font-bold tracking-tight"
        style={{ color: valueColor || '#E2E8F0' }}
      >
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-[#64748B] mt-1.5 font-mono">{subtitle}</div>
      )}
    </div>
  );
}

interface KPIsProps {
  data: KPIs | null;
  loading: boolean;
}

export function KPIGrid({ data, loading }: KPIsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-4 lg:p-5 animate-pulse">
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

  const winRateColor = data.win_rate >= 60
    ? '#00FF85'
    : data.win_rate >= 40
      ? '#FBBF24'
      : '#FF3B3B';

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
      />
      <KPICard
        title="PnL Total"
        value={`${data.pnl_total >= 0 ? '+' : ''}$${data.pnl_total.toFixed(2)}`}
        subtitle={`post-fees: $${data.pnl_post_fees.toFixed(2)}`}
        icon={DollarSign}
        iconColor={data.pnl_total >= 0 ? '#00FF85' : '#FF3B3B'}
        valueColor={data.pnl_total >= 0 ? '#00FF85' : '#FF3B3B'}
      />
      <KPICard
        title="Max Drawdown"
        value={`-$${Math.abs(data.drawdown_max).toFixed(2)}`}
        subtitle="max consecutive loss"
        icon={AlertTriangle}
        iconColor="#FF3B3B"
        valueColor="#FF3B3B"
      />
    </div>
  );
}
