import type { 
  Status, KPIs, SignalsResponse, SignalStats,
  BasketWallet, ConsensusSignal, ChartPoint, HourlySignal
} from './types';

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
const API_KEY = import.meta.env.VITE_API_KEY || '';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  getStatus: () => fetchApi<Status>('/api/status'),
  getKPIs: () => fetchApi<KPIs>('/api/kpis'),
  
  getSignals: (params?: { direction?: string; result?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.direction) searchParams.set('direction', params.direction);
    if (params?.result) searchParams.set('result', params.result);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return fetchApi<SignalsResponse>(`/api/signals${query ? `?${query}` : ''}`);
  },
  
  getSignalStats: () => fetchApi<SignalStats>('/api/signals/stats'),
  getBaskets: () => fetchApi<BasketWallet[]>('/api/baskets'),
  getConsensus: () => fetchApi<ConsensusSignal[]>('/api/consensus'),
  getChartPnL: () => fetchApi<ChartPoint[]>('/api/chart/pnl'),
  getChartSignals: () => fetchApi<HourlySignal[]>('/api/chart/signals'),
};

export { ApiError };
