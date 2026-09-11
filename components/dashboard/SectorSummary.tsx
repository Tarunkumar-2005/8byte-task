'use client';

import React, { useState } from 'react';
import { SectorSummaryData } from '@/types/portfolio';
import { formatINR, formatPercentage } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

interface SectorSummaryProps {
  sectors: SectorSummaryData[];
}

export const SectorSummary: React.FC<SectorSummaryProps> = ({ sectors }) => {
  // Track open/collapsed state of each sector accordion
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({
    // Keep first sector open by default
    [sectors[0]?.sector || '']: true,
  });

  const toggleSector = (sectorName: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorName]: !prev[sectorName],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sectors.forEach((s) => (all[s.sector] = true));
    setExpandedSectors(all);
  };

  const collapseAll = () => {
    setExpandedSectors({});
  };

  return (
    <Card className="p-5 border-gray-800/80 bg-gray-900/90 shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Sector Performance & Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Aggregated capital, valuation and gains grouped by industry sector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Sector List Accordions */}
      <div className="mt-4 space-y-3">
        {sectors.map((sec) => {
          const isExpanded = !!expandedSectors[sec.sector];
          const isGain = sec.totalGainLoss >= 0;

          return (
            <div
              key={sec.sector}
              className="rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden transition-all duration-200 hover:border-gray-700/80"
            >
              {/* Sector Summary Row (Clickable Header) */}
              <div
                onClick={() => toggleSector(sec.sector)}
                className="p-4 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none hover:bg-gray-900/50 transition-colors"
              >
                {/* Left: Sector Title & Weight Bar */}
                <div className="flex items-center gap-3 min-w-[260px]">
                  <button
                    className="p-1 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                    aria-label={isExpanded ? 'Collapse sector' : 'Expand sector'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {sec.sector}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {sec.holdingCount} Assets
                      </Badge>
                    </div>

                    {/* Weight Progress Bar */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                      <div className="w-24 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, sec.portfolioPercentage * 2.5)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px]">{sec.portfolioPercentage}% weight</span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-8 font-mono text-xs items-center">
                  {/* Investment */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-sans">
                      Investment
                    </div>
                    <div className="font-semibold text-white mt-0.5">
                      {formatINR(sec.totalInvestment)}
                    </div>
                  </div>

                  {/* Present Value */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-sans">
                      Present Value
                    </div>
                    <div className="font-semibold text-purple-300 mt-0.5">
                      {formatINR(sec.totalPresentValue)}
                    </div>
                  </div>

                  {/* Gain / Loss */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col items-start sm:items-end">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-sans">
                      Gain / Loss
                    </div>
                    <div
                      className={`font-semibold mt-0.5 flex items-center gap-1 ${
                        isGain ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isGain ? '+' : ''}
                      {formatINR(sec.totalGainLoss)}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-medium ml-1 ${
                          isGain
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {formatPercentage(sec.returnPercentage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Constituent Holdings Details */}
              {isExpanded && (
                <div className="border-t border-gray-800/80 bg-gray-900/30 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Constituents in {sec.sector}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sec.positions.map((p) => {
                      const pGain = (p.gainLoss || 0) >= 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-950/70 border border-gray-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-semibold text-white">
                              {p.displaySymbol}
                            </span>
                            <span className="text-gray-400 truncate text-[11px]">
                              {p.particulars}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono shrink-0 ml-2">
                            <span className="text-gray-300">{formatINR(p.presentValue || p.investment)}</span>
                            <span
                              className={`text-[11px] font-semibold ${
                                pGain ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {pGain ? '+' : ''}
                              {formatPercentage(p.gainLossPercentage)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
