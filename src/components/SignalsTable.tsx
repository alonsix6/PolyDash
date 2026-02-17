import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import type { Signal } from '../lib/types';

interface SignalsTableProps {
  signals: Signal[];
  loading: boolean;
}

export function SignalsTable({ signals, loading }: SignalsTableProps) {
  if (loading) {
    return (
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
        <div className="h-6 bg-[#1E1E2E] rounded w-40 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-[#1E1E2E] rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 text-gray-500">
        No signals yet
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

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
      <h3 className="text-lg font-mono mb-4">Últimas Señales</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-[#1E1E2E]">
              <th className="pb-2 font-medium">Hora</th>
              <th className="pb-2 font-medium">Dirección</th>
              <th className="pb-2 font-medium">Score</th>
              <th className="pb-2 font-medium">BTC</th>
              <th className="pb-2 font-medium">Delta</th>
              <th className="pb-2 font-medium text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {signals.slice(-20).reverse().map((signal, idx) => (
              <tr
                key={idx}
                className="border-b border-[#1E1E2E]/50 hover:bg-[#1E1E2E]/30"
              >
                <td className="py-2 font-mono text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(signal.timestamp)}
                  </div>
                </td>
                <td className="py-2">
                  <div className={`flex items-center gap-1 font-mono font-bold ${
                    signal.direction === 'UP' ? 'text-[#00FF85]' : 'text-[#FF3B3B]'
                  }`}>
                    {signal.direction === 'UP' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {signal.direction}
                  </div>
                </td>
                <td className="py-2 font-mono text-sm">
                  {signal.score.toFixed(3)}
                </td>
                <td className="py-2 font-mono text-sm">
                  ${signal.btc_price?.toLocaleString() || '--'}
                </td>
                <td className="py-2 font-mono text-sm">
                  <span className={signal.delta_pct >= 0 ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}>
                    {signal.delta_pct >= 0 ? '+' : ''}{signal.delta_pct.toFixed(2)}%
                  </span>
                </td>
                <td className="py-2 text-right">
                  <span className={`font-mono font-bold ${
                    signal.pnl_theoretical?.won ? 'text-[#00FF85]' : 'text-[#FF3B3B]'
                  }`}>
                    {signal.pnl_theoretical?.won ? '+' : ''}${signal.pnl_theoretical?.net_profit.toFixed(2) || '0.00'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
