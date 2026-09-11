'use client';

import React, { useState } from 'react';
import { RefreshCw, Info, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  lastUpdated?: string;
  isRefreshing: boolean;
  secondsUntilRefresh: number;
  autoRefreshEnabled: boolean;
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
  cacheHit?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isRefreshing,
  secondsUntilRefresh,
  autoRefreshEnabled,
  onRefresh,
  onToggleAutoRefresh,
  cacheHit = false,
}) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-inner">
            <Zap className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Dynamic Portfolio Dashboard
              </h1>
              <Badge variant="default" size="sm" className="hidden sm:inline-flex bg-gray-800/80 border-gray-700 text-gray-300">
                Octa Byte AI
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live equity analytics & sector intelligence for Indian Markets (NSE/BSE)
            </p>
          </div>
        </div>

        {/* Action Controls & Live Status */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Market Data Status Pill */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-1.5 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cacheHit ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cacheHit ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-medium text-gray-200">
              {cacheHit ? '● Cached (Fast)' : '● Live Market'}
            </span>
            <span className="text-gray-500 font-mono">|</span>
            <span className="text-gray-400 flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-gray-400" />
              {lastUpdated ? formatTime(lastUpdated) : 'Syncing...'}
            </span>
          </div>

          {/* Auto-Refresh Timer Countdown Pill */}
          {autoRefreshEnabled && (
            <button
              onClick={onToggleAutoRefresh}
              title="Click to pause automatic refresh"
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gray-900/90 hover:bg-gray-800 border border-gray-800 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span>Auto-refresh:</span>
              <span className="font-mono font-semibold text-blue-400 w-4 text-center">
                {secondsUntilRefresh}s
              </span>
            </button>
          )}

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-md shadow-blue-900/30 active:scale-95"
            aria-label="Refresh portfolio data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
          </button>

          {/* Info / Disclaimer Popover Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
            title="Data source disclaimer & refresh policy"
            aria-label="Information disclaimer"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Popover Modal / Disclaimer */}
      {showInfo && (
        <div className="max-w-7xl mx-auto mt-3 p-3.5 rounded-lg bg-gray-900/95 border border-gray-700/80 text-xs text-gray-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-gray-100">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>Data Architecture & Disclaimer</span>
            </div>
            <p className="text-gray-400">
              CMP is batch-fetched via server-side Yahoo Finance queries with 15s in-memory caching to avoid upstream rate limits. Fundamentals (P/E & Earnings) are retrieved defensively. Market data refreshes automatically every 15 seconds.
            </p>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300 border border-gray-700 self-end sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
