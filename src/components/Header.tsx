import { Activity, Wifi, WifiOff, Clock, Bitcoin, Menu, X } from 'lucide-react';
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
  const [utcTime, setUtcTime] = useState(formatTime());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getStatus();
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch status:', e);
      }
    };

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

    const statusInterval = setInterval(() => {
      fetchStatus();
      fetchBtc();
    }, 30000);

    const clockInterval = setInterval(() => {
      setUtcTime(formatTime());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(clockInterval);
    };
  }, []);

  function formatUptime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC';
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#1E1E2E]">
      <div className="px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 flex items-center justify-center">
            <Activity className="text-[#00FF85]" size={18} />
          </div>
          <span className="font-mono font-bold text-base tracking-tight">PolyDash</span>
        </div>

        {/* Center: Status Bar (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {/* Bot Status Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono ${
            status?.bot_running
              ? 'bg-[#00FF85]/10 text-[#00FF85]'
              : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
          }`}>
            {status?.bot_running ? (
              <>
                <Wifi size={12} />
                <span>RUNNING</span>
              </>
            ) : (
              <>
                <WifiOff size={12} />
                <span>STOPPED</span>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-[#1E1E2E] mx-2" />

          {/* Uptime */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
            <Clock size={12} />
            <span>{status ? formatUptime(status.uptime_seconds) : '--:--'}</span>
          </div>

          <div className="w-px h-4 bg-[#1E1E2E] mx-2" />

          {/* BTC Price */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Bitcoin size={12} className="text-[#F7931A]" />
            <span className="text-[#E2E8F0]">
              {btcPrice ? `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '--'}
            </span>
          </div>

          <div className="w-px h-4 bg-[#1E1E2E] mx-2" />

          {/* UTC Time */}
          <div className="text-xs text-[#64748B] font-mono">
            {utcTime}
          </div>
        </div>

        {/* Right: Navigation (desktop) */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                currentPage === item.id
                  ? 'bg-[#1E1E2E] text-[#E2E8F0] shadow-sm shadow-[#00FF85]/5'
                  : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#64748B] hover:text-[#E2E8F0] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E1E2E] bg-[#0A0A0F]/98 backdrop-blur-md">
          {/* Mobile status bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#1E1E2E]/50 text-xs font-mono text-[#64748B]">
            <div className={`flex items-center gap-1 ${status?.bot_running ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}`}>
              {status?.bot_running ? <Wifi size={10} /> : <WifiOff size={10} />}
              <span>{status?.bot_running ? 'RUN' : 'STOP'}</span>
            </div>
            <span>{utcTime}</span>
            {btcPrice && (
              <span className="text-[#E2E8F0]">${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            )}
          </div>
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-[#1E1E2E] text-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E1E2E]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
