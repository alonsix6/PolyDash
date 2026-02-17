import { useState, useEffect } from 'react';
import { Wallet, Copy, Check, ArrowUp, ArrowDown, Clock, Users, Loader } from 'lucide-react';
import { api } from '../lib/api';
import type { BasketWallet, ConsensusSignal } from '../lib/types';

export function Wallets() {
  const [wallets, setWallets] = useState<BasketWallet[]>([]);
  const [consensus, setConsensus] = useState<ConsensusSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletsData, consensusData] = await Promise.all([
          api.getBaskets(),
          api.getConsensus(),
        ]);
        setWallets(walletsData);
        setConsensus(consensusData);
      } catch (e) {
        console.error('Failed to fetch wallet data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyAddress = async (address: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5 animate-pulse">
              <div className="h-6 bg-[#1E1E2E] rounded w-32 mb-4" />
              <div className="h-4 bg-[#1E1E2E] rounded w-48 mb-3" />
              <div className="space-y-2">
                <div className="h-10 bg-[#1E1E2E]/50 rounded" />
                <div className="h-10 bg-[#1E1E2E]/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-12 flex flex-col items-center justify-center gap-3">
        <Loader size={24} className="text-[#64748B] animate-spin" />
        <span className="text-sm font-mono text-[#64748B] animate-pulse-glow">Monitoring wallets...</span>
        <span className="text-xs text-[#64748B]">No wallet activity detected yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consensus History Card */}
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
            <Users size={16} className="text-[#FBBF24]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Consensus History</h3>
          <span className="ml-auto text-xs text-[#64748B] font-mono">{consensus.length} events</span>
        </div>

        {consensus.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {consensus.slice(0, 20).map((c, idx) => (
                <div key={idx} className="flex-shrink-0 p-2.5 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] min-w-[140px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    {c.direction === 'UP' ? (
                      <ArrowUp size={12} className="text-[#00FF85]" />
                    ) : (
                      <ArrowDown size={12} className="text-[#FF3B3B]" />
                    )}
                    <span className={`text-xs font-mono font-bold ${
                      c.direction === 'UP' ? 'text-[#00FF85]' : 'text-[#FF3B3B]'
                    }`}>
                      {c.direction}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono ml-auto">{c.wallets}/{wallets.length || 3}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">
                    {new Date(c.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[#64748B] font-mono text-xs">No consensus events</div>
        )}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {wallets.map((wallet, idx) => (
          <div key={idx} className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5 hover:border-[#2a2a3e] transition-colors duration-200">
            {/* Wallet Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Wallet size={18} className="text-[#3B82F6]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono font-semibold text-[#E2E8F0]">
                  Wallet {idx + 1}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono truncate" title={wallet.wallet}>
                  {wallet.wallet_short}
                </div>
              </div>
              {wallet.direction && (
                <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  wallet.direction === 'UP'
                    ? 'bg-[#00FF85]/10 text-[#00FF85]'
                    : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                }`}>
                  {wallet.direction === 'UP' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {wallet.direction}
                </div>
              )}
            </div>

            {/* Full Address (copiable) */}
            <div className="mb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E]">
                <span className="text-[10px] font-mono text-[#64748B] truncate flex-1">
                  {wallet.wallet}
                </span>
                <button
                  onClick={() => copyAddress(wallet.wallet, idx)}
                  className="text-[#64748B] hover:text-[#E2E8F0] transition-colors shrink-0"
                  title="Copy address"
                >
                  {copiedIdx === idx ? <Check size={12} className="text-[#00FF85]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E]">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">Trades</div>
                <div className="text-sm font-mono font-bold text-[#E2E8F0]">{wallet.trade_count}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E]">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">Amount</div>
                <div className="text-sm font-mono font-bold text-[#E2E8F0]">${wallet.amount.toFixed(2)}</div>
              </div>
            </div>

            {/* Last Activity */}
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
              <Clock size={12} />
              <span>
                {wallet.last_trade
                  ? `Last: ${new Date(wallet.last_trade).toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : 'No activity detected'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
