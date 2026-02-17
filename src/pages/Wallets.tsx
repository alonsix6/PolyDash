import { useState, useEffect } from 'react';
import { Wallet, Copy, Check, ArrowUp, ArrowDown, Clock, Users, Loader, Search } from 'lucide-react';
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

  const totalWalletCount = Math.max(wallets.length, 3);

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="glass-card border border-[#1E1E2E] rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-[#1E1E2E] rounded w-40 mb-5" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-36 bg-[#1E1E2E]/50 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card border border-[#1E1E2E] rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-[#1E1E2E] rounded w-32 mb-5" />
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
      <div className="glass-card border border-[#1E1E2E] rounded-lg p-12 flex flex-col items-center justify-center gap-3">
        <Wallet size={32} className="text-[#64748B]/40" />
        <Loader size={20} className="text-[#64748B] animate-spin" />
        <span className="text-sm font-mono text-[#64748B] animate-pulse-glow">Monitoring wallets...</span>
        <span className="text-xs text-[#64748B]">No wallet activity detected yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Consensus History Card */}
      <div className="glass-card border border-[#1E1E2E] rounded-lg p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
            <Users size={16} className="text-[#FBBF24]" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Consensus History</h3>
          <span className="ml-auto text-xs text-[#64748B] font-mono">{consensus.length} events</span>
        </div>

        {consensus.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {consensus.slice(0, 20).map((c, idx) => {
                const isHighConsensus = c.wallets >= 2;
                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 p-2.5 rounded-lg bg-[#0A0A0F] border min-w-[140px] transition-all duration-300 ${
                      isHighConsensus ? 'border-[#00FF85]/30' : 'border-[#1E1E2E]'
                    }`}
                    style={isHighConsensus ? { boxShadow: '0 0 8px rgba(0, 255, 133, 0.1)' } : undefined}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {c.direction === 'UP' ? (
                        <ArrowUp size={12} className="text-[#00FF85]" />
                      ) : (
                        <ArrowDown size={12} className="text-[#FF3B3B]" />
                      )}
                      <span className="text-xs font-mono font-bold" style={{ color: c.direction === 'UP' ? '#00FF85' : '#FF3B3B' }}>
                        {c.direction}
                      </span>
                      <span className="text-[10px] font-mono ml-auto" style={{ color: isHighConsensus ? '#00FF85' : '#64748B' }}>
                        {c.wallets}/{totalWalletCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono">
                      {new Date(c.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                    {isHighConsensus && (
                      <div className="mt-1 text-[8px] font-mono font-bold text-[#00FF85]/70 uppercase tracking-wider">
                        consensus
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 gap-2">
            <Users size={20} className="text-[#64748B]/40" />
            <span className="text-xs text-[#64748B] font-mono">No consensus events yet</span>
          </div>
        )}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {wallets.map((wallet, idx) => (
          <div key={idx} className="glass-card border border-[#1E1E2E] rounded-lg p-6 hover:border-[#2a2a3e] transition-all duration-300 card-hover-lift">
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

      {/* Discovery Panel */}
      <div className="glass-card border border-[#1E1E2E] rounded-lg p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 flex items-center justify-center">
            <Search size={16} className="text-[#00FF85]" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Wallet Discovery</h3>
            <p className="text-[10px] text-[#64748B]">Add new wallets to monitor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg px-3 py-2 text-xs font-mono text-[#E2E8F0] placeholder:text-[#64748B]/50 focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
            disabled
          />
          <button
            disabled
            className="px-4 py-2 bg-[#1E1E2E] text-xs font-mono text-[#64748B] rounded-lg cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <p className="text-[10px] text-[#64748B] mt-2 font-mono">Coming soon - wallet discovery requires backend support</p>
      </div>
    </div>
  );
}
