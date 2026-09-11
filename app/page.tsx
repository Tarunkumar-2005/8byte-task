'use client';

import React from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Header } from '@/components/dashboard/Header';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { PortfolioCharts } from '@/components/dashboard/PortfolioCharts';
import { SectorSummary } from '@/components/dashboard/SectorSummary';
import { PortfolioTable } from '@/components/dashboard/PortfolioTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    secondsUntilRefresh,
    autoRefreshEnabled,
    refresh,
    toggleAutoRefresh,
  } = usePortfolio();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        lastUpdated={data?.meta.lastUpdated}
        isRefreshing={isRefreshing}
        secondsUntilRefresh={secondsUntilRefresh}
        autoRefreshEnabled={autoRefreshEnabled}
        onRefresh={refresh}
        onToggleAutoRefresh={toggleAutoRefresh}
        cacheHit={data?.meta.cacheHit}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Initial Loading State */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error && !data ? (
          /* Hard Error State (No data yet available) */
          <ErrorState message={error} onRetry={refresh} isRetrying={isRefreshing} />
        ) : data ? (
          <>
            {/* Warning banner if background refresh failed but cached data is available */}
            {error && (
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
                <span>
                  ⚠️ Live market refresh encountered an issue ({error}). Displaying cached snapshot.
                </span>
                <button
                  onClick={refresh}
                  className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded font-medium shrink-0 border border-amber-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 1. Overview Summary Cards */}
            <PortfolioOverview summary={data.summary} />

            {/* 2. Analytical Quick Stats */}
            <QuickStats summary={data.summary} sectors={data.sectors} />

            {/* 3. Recharts Visualizations Grid */}
            <PortfolioCharts sectors={data.sectors} />

            {/* 4. Full Holdings Table with Search, Filter & Sort */}
            <PortfolioTable positions={data.data} sectors={data.sectors} />

            {/* 5. Sector Aggregation & Breakdown */}
            <SectorSummary sectors={data.sectors} />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/80 py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-300">
              Octa Byte AI Pvt Ltd
            </span>
            <span>• Full-Stack Assignment Submission</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>Market Data Source: Yahoo Finance &amp; Google Finance</span>
            <span>• Auto-refresh: 15s interval</span>
            <span>• Server-side Cached</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
