import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIs } from '../lib/types';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function KPICard({ title, value, subtitle, trend, trendValue }: KPICardProps) {
  const trendColor = {
    up: 'text-[#00FF85]',
    down: 'text-[#FF3B3B]',
    neutral: 'text-[#3B82F6]',
  }[trend || 'neutral'];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-3xl font-mono font-bold">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      {trend && (
        <div className={`flex items-center gap-1 text-sm mt-2 ${trendColor}`}>
          <TrendIcon size={14} />
          <span>{trendValue}</span>
        </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-[#1E1E2E] rounded w-20 mb-3"></div>
            <div className="h-8 bg-[#1E1E2E] rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Señales"
        value={data.total_signals}
        subtitle="señales generadas"
      />
      <KPICard
        title="Win Rate"
        value={`${data.win_rate}%`}
        trend={data.win_rate >= 50 ? 'up' : 'down'}
        trendValue={data.win_rate >= 50 ? 'Positivo' : 'Negativo'}
      />
      <KPICard
        title="PnL Teórico"
        value={`$${data.pnl_total.toFixed(2)}`}
        trend={data.pnl_total >= 0 ? 'up' : 'down'}
        subtitle="antes de fees"
      />
      <KPICard
        title="Drawdown Máximo"
        value={`$${data.drawdown_max.toFixed(2)}`}
        trend={data.drawdown_max === 0 ? 'neutral' : 'down'}
        subtitle="pérdida máxima"
      />
    </div>
  );
}
