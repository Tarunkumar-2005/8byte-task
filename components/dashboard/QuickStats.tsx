'use client';

import React from 'react';
import { PortfolioSummary, SectorSummaryData } from '@/types/portfolio';
import { formatINR, formatPercentage } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Award, AlertOctagon, Sparkles, ShieldCheck } from 'lucide-react';

interface QuickStatsProps {
  summary: PortfolioSummary;
  sectors: SectorSummaryData[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ summary, sectors }) => {
  const topSector = sectors.length > 0 ? sectors[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Top Gainer */}
      <Card className="p-4 bg-gray-900/60 border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Award className="h-4 w-4" />
          <span>Top Gainer</span>
        </div>
        {summary.topGainer ? (
          <div>
            <div className="text-sm font-bold text-white truncate">
              {summary.topGainer.particulars}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">({summary.topGainer.symbol})</span>
              <span className="text-emerald-400 font-mono font-semibold">
                +{summary.topGainer.gainPercentage.toFixed(2)}% ({formatINR(summary.topGainer.gainAmount)})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">No gainers recorded</div>
        )}
      </Card>

      {/* Top Loser */}
      <Card className="p-4 bg-gray-900/60 border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
          <AlertOctagon className="h-4 w-4" />
          <span>Top Loser</span>
        </div>
        {summary.topLoser ? (
          <div>
            <div className="text-sm font-bold text-white truncate">
              {summary.topLoser.particulars}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">({summary.topLoser.symbol})</span>
              <span className="text-rose-400 font-mono font-semibold">
                {summary.topLoser.lossPercentage.toFixed(2)}% ({formatINR(summary.topLoser.lossAmount)})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">No losers recorded</div>
        )}
      </Card>

      {/* Largest Sector */}
      <Card className="p-4 bg-gray-900/60 border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
          <Sparkles className="h-4 w-4" />
          <span>Dominant Sector</span>
        </div>
        {topSector ? (
          <div>
            <div className="text-sm font-bold text-white truncate">
              {topSector.sector}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-400">{topSector.holdingCount} Assets</span>
              <span className="text-blue-400 font-mono font-semibold">
                {topSector.portfolioPercentage}% ({formatINR(topSector.totalInvestment, { compact: true })})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">No sector data</div>
        )}
      </Card>

      {/* Data Source & Status */}
      <Card className="p-4 bg-gray-900/60 border-gray-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>Market Feed Health</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">
            {summary.liveQuotesCount} / {summary.totalHoldings} Symbols Synced
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
            <span>Rate-limit Shield</span>
            <span className="text-emerald-400 font-semibold font-mono">Active (15s TTL)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
