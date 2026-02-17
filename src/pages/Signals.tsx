import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowUp, ArrowDown, Clock, Radio, TrendingUp, TrendingDown, Zap, Award, ChevronLeft, ChevronRight, Filter, Download, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { Signal, SignalStats } from '../lib/types';

const PAGE_SIZE = 20;

type SortKey = 'timestamp' | 'score' | 'confidence' | 'btc_price' | 'delta_pct' | 'roi_pct' | 'pnl';
type SortDir = 'asc' | 'desc';

export function Signals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'UP' | 'DOWN'>('ALL');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: { limit: number; offset: number; direction?: string; result?: string } = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
      if (directionFilter !== 'ALL') {
        params.direction = directionFilter;
      }
      if (resultFilter !== 'ALL') {
        params.result = resultFilter.toLowerCase();
      }

      const [signalsRes, statsData] = await Promise.all([
        api.getSignals(params),
        api.getSignalStats(),
      ]);

      setSignals(signalsRes.data);
      setTotal(signalsRes.total);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to fetch signals:', e);
    } finally {
      setLoading(false);
    }
  }, [page, directionFilter, resultFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedSignals = useMemo(() => {
    const arr = [...signals];
    arr.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortKey) {
        case 'timestamp': aVal = new Date(a.timestamp).getTime(); bVal = new Date(b.timestamp).getTime(); break;
        case 'score': aVal = a.score; bVal = b.score; break;
        case 'confidence': aVal = a.confidence; bVal = b.confidence; break;
        case 'btc_price': aVal = a.btc_price; bVal = b.btc_price; break;
        case 'delta_pct': aVal = a.delta_pct; bVal = b.delta_pct; break;
        case 'roi_pct': aVal = a.pnl_theoretical?.roi_pct ?? 0; bVal = b.pnl_theoretical?.roi_pct ?? 0; break;
        case 'pnl': aVal = a.pnl_theoretical?.net_profit ?? 0; bVal = b.pnl_theoretical?.net_profit ?? 0; break;
        default: aVal = 0; bVal = 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [signals, sortKey, sortDir]);

  const exportCSV = (data: Signal[]) => {
    if (data.length === 0) return;
    const header = 'Timestamp,Direction,Score,Confidence,BTC Price,Delta %,ROI %,PnL,Won';
    const rows = data.map(s => [
      s.timestamp,
      s.direction ?? '',
      s.score.toFixed(3),
      (s.confidence * 100).toFixed(0),
      s.btc_price,
      s.delta_pct.toFixed(2),
      (s.pnl_theoretical?.roi_pct ?? 0).toFixed(2),
      (s.pnl_theoretical?.net_profit ?? 0).toFixed(2),
      s.pnl_theoretical?.won ? 'YES' : 'NO',
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polydash-signals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronDown size={10} className="opacity-30 ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="ml-0.5" style={{ color: '#3B82F6' }} />
      : <ChevronDown size={10} className="ml-0.5" style={{ color: '#3B82F6' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
        <StatCard
          title="Win Rate UP"
          value={stats ? `${stats.win_rate_up.toFixed(1)}%` : '--'}
          icon={TrendingUp}
          iconColor="#00FF85"
        />
        <StatCard
          title="Win Rate DOWN"
          value={stats ? `${stats.win_rate_down.toFixed(1)}%` : '--'}
          icon={TrendingDown}
          iconColor="#FF3B3B"
        />
        <StatCard
          title="Avg PnL"
          value={stats ? `$${stats.avg_pnl.toFixed(2)}` : '--'}
          icon={Zap}
          iconColor="#3B82F6"
        />
        <StatCard
          title="Best Streak"
          value={stats ? `${stats.best_streak}` : '--'}
          subtitle={stats ? `worst: ${stats.worst_streak}` : undefined}
          icon={Award}
          iconColor="#FBBF24"
        />
      </div>

      {/* Table Card */}
      <div className="glass-card border border-[#1E1E2E] rounded-lg" style={{ padding: '24px' }}>
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Radio size={16} className="text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">All Signals</h3>
            <span className="text-xs text-[#64748B] font-mono">{total} total</span>
          </div>

          {/* Filters + CSV Export */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Direction Filter */}
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-[#64748B] mr-1" />
              {(['ALL', 'UP', 'DOWN'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => { setPage(0); setDirectionFilter(dir); }}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    directionFilter === dir
                      ? dir === 'UP' ? 'bg-[#00FF85]/10 text-[#00FF85]'
                        : dir === 'DOWN' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                        : 'bg-[#1E1E2E] text-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>

            {/* Result Filter */}
            <div className="h-4 w-px bg-[#1E1E2E]" />
            <div className="flex items-center gap-1">
              {(['ALL', 'WIN', 'LOSS'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => { setPage(0); setResultFilter(res); }}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors flex items-center gap-1 ${
                    resultFilter === res
                      ? res === 'WIN' ? 'bg-[#00FF85]/10 text-[#00FF85]'
                        : res === 'LOSS' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                        : 'bg-[#1E1E2E] text-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50'
                  }`}
                >
                  {res === 'WIN' && <CheckCircle size={10} />}
                  {res === 'LOSS' && <XCircle size={10} />}
                  {res}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[#1E1E2E]" />
            <button
              onClick={() => exportCSV(signals)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50 rounded-md transition-colors"
              title="Export CSV"
            >
              <Download size={12} />
              CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-[10px] text-[#64748B] uppercase tracking-wider border-b border-[#1E1E2E]">
                <th className="pb-2.5 pl-2 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('timestamp')}>
                  <span className="inline-flex items-center">Time <SortIcon column="timestamp" /></span>
                </th>
                <th className="pb-2.5 font-medium">Dir</th>
                <th className="pb-2.5 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('score')}>
                  <span className="inline-flex items-center">Score <SortIcon column="score" /></span>
                </th>
                <th className="pb-2.5 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('confidence')}>
                  <span className="inline-flex items-center">Conf. <SortIcon column="confidence" /></span>
                </th>
                <th className="pb-2.5 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('btc_price')}>
                  <span className="inline-flex items-center">BTC <SortIcon column="btc_price" /></span>
                </th>
                <th className="pb-2.5 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('delta_pct')}>
                  <span className="inline-flex items-center">Delta <SortIcon column="delta_pct" /></span>
                </th>
                <th className="pb-2.5 font-medium cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('roi_pct')}>
                  <span className="inline-flex items-center">ROI <SortIcon column="roi_pct" /></span>
                </th>
                <th className="pb-2.5 font-medium text-center">Result</th>
                <th className="pb-2.5 pr-2 font-medium text-right cursor-pointer select-none hover:text-[#E2E8F0] transition-colors" onClick={() => handleSort('pnl')}>
                  <span className="inline-flex items-center justify-end">PnL <SortIcon column="pnl" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(PAGE_SIZE)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-2.5">
                      <div className="h-8 bg-[#1E1E2E]/50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedSignals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Radio size={24} className="text-[#64748B]/50" />
                      <span className="text-[#64748B] font-mono text-sm">No signals found</span>
                      <span className="text-[10px] text-[#64748B]/60 font-mono">Try adjusting your filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSignals.map((signal, idx) => {
                  const pnl = signal.pnl_theoretical?.net_profit ?? 0;
                  const won = signal.pnl_theoretical?.won ?? false;
                  const roi = signal.pnl_theoretical?.roi_pct ?? 0;

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
                        {(signal.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 font-mono text-xs text-[#E2E8F0]">
                        ${signal.btc_price?.toLocaleString() ?? '--'}
                      </td>
                      <td className="py-2.5 font-mono text-xs">
                        <span style={{ color: signal.delta_pct >= 0 ? '#00FF85' : '#FF3B3B' }}>
                          {signal.delta_pct >= 0 ? '+' : ''}{signal.delta_pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-xs">
                        <span style={{ color: roi >= 0 ? '#00FF85' : '#FF3B3B' }}>
                          {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          won ? 'bg-[#00FF85]/10 text-[#00FF85]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                        }`}>
                          {won ? <CheckCircle size={9} /> : <XCircle size={9} />}
                          {won ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className="font-mono text-xs font-bold" style={{ color: won ? '#00FF85' : '#FF3B3B' }}>
                          {won ? '+' : ''}{pnl !== 0 ? `$${pnl.toFixed(2)}` : '$0.00'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1E1E2E]">
            <span className="text-xs text-[#64748B] font-mono">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 text-xs font-mono rounded-md transition-colors ${
                      page === pageNum
                        ? 'bg-[#1E1E2E] text-[#E2E8F0]'
                        : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
}) {
  return (
    <div className="glass-card border border-[#1E1E2E] rounded-lg relative overflow-hidden group hover:border-[#2a2a3e] transition-all duration-300" style={{ padding: '24px' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${iconColor}40, transparent)` }} />
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{title}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${iconColor}10`, color: iconColor }}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-xl font-mono font-bold text-[#E2E8F0]">{value}</div>
      {subtitle && <div className="text-[10px] text-[#64748B] mt-1 font-mono">{subtitle}</div>}
    </div>
  );
}
