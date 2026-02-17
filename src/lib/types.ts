// API Types

export interface Status {
  uptime_seconds: number;
  uptime_hours: number;
  bot_running: boolean;
  signals_count: number;
  version: string;
  timestamp: string;
}

export interface KPIs {
  total_signals: number;
  win_rate: number;
  pnl_total: number;
  pnl_post_fees: number;
  drawdown_max: number;
  avg_pnl: number;
}

export interface Signal {
  timestamp: string;
  type: string;
  event: string;
  slug: string;
  direction: 'UP' | 'DOWN' | null;
  score: number;
  confidence: number;
  btc_price: number;
  open_price: number;
  delta_pct: number;
  close_ts: number;
  seconds_remaining: number;
  data_points: number;
  indicators: Record<string, { value: number; score: number }>;
  pnl_theoretical: {
    won: boolean;
    net_profit: number;
    roi_pct: number;
    entry_price: number;
    total_fee: number;
  };
  dry_run: boolean;
}

export interface SignalsResponse {
  total: number;
  limit: number;
  offset: number;
  data: Signal[];
}

export interface SignalStats {
  win_rate_up: number;
  win_rate_down: number;
  avg_pnl: number;
  best_streak: number;
  worst_streak: number;
  best_hour: number;
}

export interface BasketWallet {
  wallet: string;
  wallet_short: string;
  last_trade: string | null;
  direction: string;
  amount: number;
  trade_count: number;
}

export interface ConsensusSignal {
  timestamp: string;
  wallets: number;
  direction: string;
  market: string;
}

export interface ChartPoint {
  timestamp: string;
  pnl_cumulative: number;
}

export interface HourlySignal {
  hour: number;
  count: number;
}
