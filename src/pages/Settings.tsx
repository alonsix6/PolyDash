import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, RefreshCw, Moon, Server, Clock, Radio, Hash } from 'lucide-react';
import { api } from '../lib/api';
import type { Status } from '../lib/types';

export function Settings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getStatus();
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch status:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
          <SettingsIcon size={18} className="text-[#3B82F6]" />
        </div>
        <div>
          <h2 className="text-base font-mono font-semibold text-[#E2E8F0]">Settings</h2>
          <p className="text-xs text-[#64748B]">Dashboard configuration and bot info</p>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-[#3B82F6]" />
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">API Configuration</h3>
        </div>

        <div className="space-y-3">
          <SettingsRow label="API URL" value={apiUrl} />
          <SettingsRow label="API Key" value={import.meta.env.VITE_API_KEY ? 'Configured' : 'Not set'} />
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Moon size={16} className="text-[#FBBF24]" />
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Display</h3>
        </div>

        <div className="space-y-3">
          {/* Dark Mode Toggle (decorative) */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-mono text-[#E2E8F0]">Dark Mode</div>
              <div className="text-[10px] text-[#64748B]">Terminal theme is always active</div>
            </div>
            <div className="w-10 h-5 rounded-full bg-[#00FF85]/20 border border-[#00FF85]/30 flex items-center px-0.5">
              <div className="w-4 h-4 rounded-full bg-[#00FF85] ml-auto" />
            </div>
          </div>

          {/* Refresh Interval */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-mono text-[#E2E8F0]">Auto-refresh</div>
              <div className="text-[10px] text-[#64748B]">Data refresh interval</div>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw size={12} className="text-[#64748B]" />
              <span className="text-xs font-mono text-[#E2E8F0]">30s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Info */}
      <div className="bg-[#111116] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} className="text-[#00FF85]" />
          <h3 className="text-sm font-mono font-semibold text-[#E2E8F0]">Bot Info</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-[#1E1E2E]/50 rounded animate-pulse" />
            ))}
          </div>
        ) : status ? (
          <div className="space-y-3">
            <SettingsRow
              label="Version"
              value={status.version}
              icon={<Hash size={12} className="text-[#64748B]" />}
            />
            <SettingsRow
              label="Uptime"
              value={formatUptime(status.uptime_seconds)}
              icon={<Clock size={12} className="text-[#64748B]" />}
            />
            <SettingsRow
              label="Signals Count"
              value={status.signals_count.toLocaleString()}
              icon={<Radio size={12} className="text-[#64748B]" />}
            />
            <SettingsRow
              label="Status"
              value={status.bot_running ? 'Running' : 'Stopped'}
              valueColor={status.bot_running ? 'text-[#00FF85]' : 'text-[#FF3B3B]'}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-[#64748B] font-mono text-xs">
            Unable to fetch bot status
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsRow({ label, value, icon, valueColor }: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1E1E2E]/50 last:border-b-0">
      <span className="text-xs text-[#64748B]">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`text-xs font-mono ${valueColor || 'text-[#E2E8F0]'}`}>{value}</span>
      </div>
    </div>
  );
}
