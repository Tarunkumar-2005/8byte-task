'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart, Layers } from 'lucide-react';
import { PortfolioSummary } from '@/types/portfolio';
import { formatINR, formatPercentage } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface PortfolioOverviewProps {
  summary: PortfolioSummary;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ summary }) => {
  const isOverallGain = summary.totalGainLoss >= 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Investment */}
      <Card hoverEffect className="relative overflow-hidden border-gray-800/80 bg-gradient-to-br from-gray-900 to-gray-900/60">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Investment</span>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
          {formatINR(summary.totalInvestment)}
        </div>
        <div className="mt-2 flex items-center text-xs text-gray-400">
          <span>Cost basis across {summary.totalHoldings} assets</span>
        </div>
      </Card>

      {/* 2. Present Value */}
      <Card hoverEffect className="relative overflow-hidden border-gray-800/80 bg-gradient-to-br from-gray-900 to-gray-900/60">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Present Value</span>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
          {formatINR(summary.totalPresentValue)}
        </div>
        <div className="mt-2 flex items-center text-xs text-gray-400">
          <span>Live market valuation</span>
        </div>
      </Card>

      {/* 3. Total Gain / Loss */}
      <Card
        hoverEffect
        className={`relative overflow-hidden border-gray-800/80 bg-gradient-to-br from-gray-900 to-gray-900/60 ${
          isOverallGain ? 'hover:border-emerald-700/50' : 'hover:border-rose-700/50'
        }`}
      >
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Gain / Loss</span>
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
              isOverallGain
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isOverallGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
        <div
          className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
            isOverallGain ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isOverallGain ? '+' : ''}
          {formatINR(summary.totalGainLoss)}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded ${
              isOverallGain
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
            }`}
          >
            {isOverallGain ? '↑' : '↓'} {formatPercentage(summary.overallReturnPercentage)}
          </span>
          <span className="text-gray-400 font-normal">All-time return</span>
        </div>
      </Card>

      {/* 4. Total Holdings */}
      <Card hoverEffect className="relative overflow-hidden border-gray-800/80 bg-gradient-to-br from-gray-900 to-gray-900/60">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Holdings</span>
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
          {summary.totalHoldings}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            ● {summary.liveQuotesCount} Live
          </span>
          {summary.cachedQuotesCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              ● {summary.cachedQuotesCount} Cached
            </span>
          )}
          {summary.errorQuotesCount > 0 && (
            <span className="inline-flex items-center gap-1 text-rose-400">
              ● {summary.errorQuotesCount} Error
            </span>
          )}
        </div>
      </Card>
    </section>
  );
};
