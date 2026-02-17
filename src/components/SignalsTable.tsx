import { ArrowUp, ArrowDown, Clock, Radio } from 'lucide-react';
import type { Signal } from '../lib/types';

interface SignalsTableProps {
  signals: Signal[];
  loading: boolean;
}

export function SignalsTable({ signals, loading }: SignalsTableProps) {
  if (loading) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-lg" style={{ padding: '24px' }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-[#1E1E2E] rounded-lg" />
          <div className="h-5 bg-[#1E1E2E] rounded w-32" />
        </div>
        <div className="space-y-1.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-[#1E1E2E]/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-lg" style={{ padding: '24px' }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
            <Radio size={16} className="text-[#3B82F6]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Recent Signals</h3>
        </div>
        <div className="flex flex-col items-center py-8 gap-2">
          <Radio size={20} className="text-[#64748B]/40" />
          <span className="text-[#64748B] font-mono text-sm">No signals yet</span>
          <span className="text-[10px] text-[#64748B]/60 font-mono">Signals will appear here as they are generated</span>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const displaySignals = signals.slice(-20).reverse();

  return (
    <div className="glass-card border border-[#1E1E2E] rounded-lg flex flex-col" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
          <Radio size={16} className="text-[#3B82F6]" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Recent Signals</h3>
        <span className="ml-auto text-xs text-[#64748B] font-mono">{displaySignals.length} signals</span>
      </div>

      {/* Table with scroll */}
      <div className="overflow-y-auto max-h-[400px] overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 bg-[#111116] z-10">
            <tr className="text-left text-[10px] text-[#64748B] uppercase tracking-wider border-b border-[#1E1E2E]">
              <th className="pb-2.5 pl-2 font-medium">Time</th>
              <th className="pb-2.5 font-medium">Direction</th>
              <th className="pb-2.5 font-medium">Score</th>
              <th className="pb-2.5 font-medium">BTC Price</th>
              <th className="pb-2.5 font-medium">Delta</th>
              <th className="pb-2.5 pr-2 font-medium text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {displaySignals.map((signal, idx) => {
              const pnl = signal.pnl_theoretical?.net_profit ?? 0;
              const won = signal.pnl_theoretical?.won ?? false;

              return (
                <tr
                  key={idx}
                  className="table-row-stripe border-b border-[#1E1E2E]/30 hover:bg-[#1E1E2E]/40 transition-colors duration-100"
                >
                  <td className="py-2.5 pl-2 font-mono text-xs text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="shrink-0" />
                      {formatTime(signal.timestamp)}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      signal.direction === 'UP'
                        ? 'bg-[#00FF85]/10 text-[#00FF85]'
                        : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                    }`}>
                      {signal.direction === 'UP' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {signal.direction}
                    </div>
                  </td>
                  <td className="py-2.5 font-mono text-xs text-[#E2E8F0]">
                    {signal.score.toFixed(3)}
                  </td>
                  <td className="py-2.5 font-mono text-xs text-[#E2E8F0]">
                    ${signal.btc_price?.toLocaleString() ?? '--'}
                  </td>
                  <td className="py-2.5 font-mono text-xs">
                    <span className={signal.delta_pct >= 0 ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}>
                      {signal.delta_pct >= 0 ? '+' : ''}{signal.delta_pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`inline-flex items-center text-[9px] font-mono font-bold px-1 py-0.5 rounded ${
                        won ? 'bg-[#00FF85]/10 text-[#00FF85]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                      }`}>
                        {won ? 'W' : 'L'}
                      </span>
                      <span className="font-mono text-xs font-bold" style={{ color: won ? '#00FF85' : '#FF3B3B' }}>
                        {won ? '+' : ''}{pnl !== 0 ? `$${pnl.toFixed(2)}` : '$0.00'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
