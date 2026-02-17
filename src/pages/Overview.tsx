import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { KPIGrid } from '../components/KPIGrid';
import { PnLChart } from '../components/PnLChart';
import { SignalsTable } from '../components/SignalsTable';
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
          api.getSignals({ limit: 20 }),
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
      <KPIGrid data={kpis} loading={loading} />
      <PnLChart data={chartData} loading={loading} />
      <SignalsTable signals={signals} loading={loading} />
    </div>
  );
}
