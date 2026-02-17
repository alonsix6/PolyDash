import { useState, useEffect } from 'react';
import { Wallet, Users, ArrowUp, ArrowDown, Loader } from 'lucide-react';
import { api } from '../lib/api';
import type { BasketWallet, ConsensusSignal } from '../lib/types';

export function WalletConsensus() {
  const [wallets, setWallets] = useState<BasketWallet[]>([]);
  const [consensus, setConsensus] = useState<ConsensusSignal[]>([]);
  const [loading, setLoading] = useState(true);

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

  const latestConsensus = consensus.length > 0 ? consensus[0] : null;
  const consensusLevel = latestConsensus?.wallets ?? 0;
  const totalWallets = Math.max(wallets.length, 3);

  const consensusColor = consensusLevel >= totalWallets
    ? '#00FF85'
    : consensusLevel >= Math.ceil(totalWallets / 2)
      ? '#FBBF24'
      : '#64748B';

  if (loading) {
    return (
      <div className="glass-card border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-[#1E1E2E] rounded-lg" />
          <div className="h-5 bg-[#1E1E2E] rounded w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#1E1E2E]/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasConsensus = consensusLevel >= 2;

  return (
    <div className={`glass-card border rounded-xl p-5 transition-all duration-500 ${hasConsensus ? 'animate-consensus-glow' : 'border-[#1E1E2E]'}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center">
          <Users size={16} className="text-[#FBBF24]" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Wallet Consensus</h3>
        {hasConsensus && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00FF85]/10 text-[#00FF85] animate-pulse-glow">
            CONSENSUS SIGNAL
          </span>
        )}
      </div>

      {/* Consensus Level */}
      <div className="mb-4 p-3 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Consensus Level</span>
          <span className="text-sm font-mono font-bold" style={{ color: consensusColor }}>
            {consensusLevel}/{totalWallets}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalWallets }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < consensusLevel ? consensusColor : '#1E1E2E',
              }}
            />
          ))}
        </div>
        {latestConsensus && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
            {latestConsensus.direction === 'UP' ? (
              <ArrowUp size={12} className="text-[#00FF85]" />
            ) : latestConsensus.direction === 'DOWN' ? (
              <ArrowDown size={12} className="text-[#FF3B3B]" />
            ) : null}
            <span className={
              latestConsensus.direction === 'UP' ? 'text-[#00FF85]' :
              latestConsensus.direction === 'DOWN' ? 'text-[#FF3B3B]' : ''
            }>
              {latestConsensus.direction || 'N/A'}
            </span>
            <span className="text-[#64748B]">
              {new Date(latestConsensus.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Wallet Cards */}
      {wallets.length > 0 ? (
        <div className="space-y-2.5">
          {wallets.map((wallet, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] hover:border-[#2a2a3e] transition-colors duration-150">
              <div className="flex items-center gap-2 mb-1.5">
                <Wallet size={12} className="text-[#64748B]" />
                <span className="text-xs font-mono text-[#E2E8F0]" title={wallet.wallet}>
                  {wallet.wallet_short}
                </span>
                {wallet.direction && (
                  <span className={`ml-auto inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    wallet.direction === 'UP'
                      ? 'bg-[#00FF85]/10 text-[#00FF85]'
                      : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                  }`}>
                    {wallet.direction === 'UP' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {wallet.direction}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                <span>
                  {wallet.last_trade
                    ? `Last: ${new Date(wallet.last_trade).toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : 'No activity'}
                </span>
                <span>{wallet.trade_count} trades</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Loader size={20} className="text-[#64748B] animate-spin" />
          <span className="text-xs font-mono text-[#64748B] animate-pulse-glow">Monitoring...</span>
        </div>
      )}
    </div>
  );
}
