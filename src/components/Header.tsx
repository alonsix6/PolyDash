import { Activity, Wifi, WifiOff, Clock, Bitcoin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Status } from '../lib/types';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'signals', label: 'Signals' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'settings', label: 'Settings' },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [status, setStatus] = useState<Status | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch status
    const fetchStatus = async () => {
      try {
        const data = await api.getStatus();
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch status:', e);
      }
    };

    // Fetch BTC price (public API)
    const fetchBtc = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await res.json();
        setBtcPrice(parseFloat(data.price));
      } catch (e) {
        console.error('Failed to fetch BTC:', e);
      }
    };

    fetchStatus();
    fetchBtc();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchBtc();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#1E1E2E]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Activity className="text-[#00FF85]" size={24} />
          <span className="font-mono font-bold text-lg">Polymarket Bot</span>
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {/* Bot Status */}
          <div className="flex items-center gap-2">
            {status?.bot_running ? (
              <>
                <Wifi size={14} className="text-[#00FF85]" />
                <span className="text-[#00FF85]">Running</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-[#FF3B3B]" />
                <span className="text-[#FF3B3B]">Stopped</span>
              </>
            )}
          </div>

          {/* Uptime */}
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={14} />
            <span>{status ? formatUptime(status.uptime_seconds) : '--'}</span>
          </div>

          {/* BTC Price */}
          <div className="flex items-center gap-2 text-gray-400">
            <Bitcoin size={14} className="text-[#F7931A]" />
            <span className="font-mono">
              {btcPrice ? `$${btcPrice.toLocaleString()}` : '--'}
            </span>
          </div>

          {/* Time */}
          <div className="text-gray-400 font-mono text-sm">
            {formatTime()}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-[#1E1E2E] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E1E2E]/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
