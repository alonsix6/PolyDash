import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { KPIGrid } from '../components/KPIGrid';
import { PnLChart } from '../components/PnLChart';
import { SignalsTable } from '../components/SignalsTable';
import { SignalDistribution } from '../components/SignalDistribution';
import { WalletConsensus } from '../components/WalletConsensus';
import type { KPIs, Signal, ChartPoint } from '../lib/types';

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpisData, signalsData, pnlData] = await Promise.all([
          api.getKPIs(),
          api.getSignals({ limit: 50 }),
          api.getChartPnL(),
        ]);
        setKpis(kpisData);
        setSignals(signalsData.data);
        setChartData(pnlData);
      } catch (e) {
        console.error('Failed to fetch data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <KPIGrid data={kpis} loading={loading} chartData={chartData} />

      {/* Row 2: PnL Chart - Full Width */}
      <PnLChart data={chartData} loading={loading} />

      {/* Row 3: Signals Table (60%) + Signal Distribution (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SignalsTable signals={signals} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <SignalDistribution signals={signals} loading={loading} />
        </div>
      </div>

      {/* Row 4: Wallet Baskets */}
      <WalletConsensus />
    </div>
  );
}
