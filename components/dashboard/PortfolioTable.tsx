'use client';

import React, { useState, useMemo } from 'react';
import {
  PortfolioPosition,
  SectorSummaryData,
} from '@/types/portfolio';
import {
  formatINR,
  formatPercentage,
  formatNumber,
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Check,
} from 'lucide-react';

interface PortfolioTableProps {
  positions: PortfolioPosition[];
  sectors: SectorSummaryData[];
}

type SortField =
  | 'particulars'
  | 'purchasePrice'
  | 'quantity'
  | 'investment'
  | 'portfolioPercentage'
  | 'cmp'
  | 'presentValue'
  | 'gainLoss'
  | 'peRatio';

type SortDirection = 'asc' | 'desc';

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  positions,
  sectors,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('investment');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle column header sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort holdings
  const filteredAndSortedPositions = useMemo(() => {
    return positions
      .filter((pos) => {
        // Sector filter
        if (selectedSector !== 'ALL' && pos.sector !== selectedSector) {
          return false;
        }
        // Search query filter (matches particulars, display symbol, or raw symbol)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = pos.particulars.toLowerCase().includes(query);
          const matchSymbol = pos.displaySymbol.toLowerCase().includes(query);
          const matchFullSymbol = pos.symbol.toLowerCase().includes(query);
          return matchName || matchSymbol || matchFullSymbol;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        // Handle string sorting
        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        // Handle null / undefined numbers in sorting
        if (valA === null || valA === undefined) valA = sortDirection === 'asc' ? Infinity : -Infinity;
        if (valB === null || valB === undefined) valB = sortDirection === 'asc' ? Infinity : -Infinity;

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [positions, selectedSector, searchQuery, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-500 opacity-60 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-400 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-400 ml-1" />
    );
  };

  return (
    <Card className="p-0 overflow-hidden border-gray-800/80 bg-gray-900/90 shadow-xl">
      {/* Table Header Controls: Search & Sector Filter */}
      <div className="p-4 sm:p-5 border-b border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-950/40">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">Holdings & Live Valuation</h2>
          <Badge variant="outline" size="sm" className="font-mono">
            {filteredAndSortedPositions.length} Assets
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stock name, ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-700/80 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Sector Filter Dropdown */}
          <div className="relative min-w-[170px]">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="h-3.5 w-3.5" />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-gray-900 border border-gray-700/80 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
            >
              <option value="ALL">All Sectors ({positions.length})</option>
              {sectors.map((s) => (
                <option key={s.sector} value={s.sector}>
                  {s.sector} ({s.holdingCount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300 border-collapse">
          {/* Sticky Table Header */}
          <thead className="bg-gray-950/80 text-gray-400 font-medium uppercase tracking-wider text-[11px] sticky top-0 z-10 border-b border-gray-800">
            <tr>
              {/* 1. Particulars */}
              <th
                onClick={() => handleSort('particulars')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  Particulars {renderSortIcon('particulars')}
                </div>
              </th>

              {/* 2. Purchase Price */}
              <th
                onClick={() => handleSort('purchasePrice')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  Buy Price {renderSortIcon('purchasePrice')}
                </div>
              </th>

              {/* 3. Qty */}
              <th
                onClick={() => handleSort('quantity')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  Qty {renderSortIcon('quantity')}
                </div>
              </th>

              {/* 4. Investment */}
              <th
                onClick={() => handleSort('investment')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  Investment {renderSortIcon('investment')}
                </div>
              </th>

              {/* 5. Portfolio % */}
              <th
                onClick={() => handleSort('portfolioPercentage')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  Portfolio % {renderSortIcon('portfolioPercentage')}
                </div>
              </th>

              {/* 6. Exchange */}
              <th className="py-3.5 px-3 text-center">Exchange</th>

              {/* 7. CMP */}
              <th
                onClick={() => handleSort('cmp')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  CMP {renderSortIcon('cmp')}
                </div>
              </th>

              {/* 8. Present Value */}
              <th
                onClick={() => handleSort('presentValue')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  Present Value {renderSortIcon('presentValue')}
                </div>
              </th>

              {/* 9. Gain / Loss */}
              <th
                onClick={() => handleSort('gainLoss')}
                className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors min-w-[140px]"
              >
                <div className="flex items-center justify-end">
                  Gain / Loss {renderSortIcon('gainLoss')}
                </div>
              </th>

              {/* 10. P/E Ratio */}
              <th
                onClick={() => handleSort('peRatio')}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end">
                  P/E {renderSortIcon('peRatio')}
                </div>
              </th>

              {/* 11. Latest Earnings */}
              <th className="py-3.5 px-4 text-right">Latest Earnings</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-800/60 font-mono">
            {filteredAndSortedPositions.length > 0 ? (
              filteredAndSortedPositions.map((pos) => {
                const isGain = (pos.gainLoss || 0) >= 0;
                const hasValidCMP = pos.cmp !== null;

                return (
                  <tr
                    key={pos.id}
                    className="table-row-hover transition-colors font-sans text-xs group"
                  >
                    {/* 1. Particulars */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {pos.particulars}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono font-semibold text-gray-400">
                            {pos.displaySymbol}
                          </span>
                          <span className="text-[10px] text-gray-500 font-sans">
                            • {pos.sector}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Purchase Price */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                      {formatINR(pos.purchasePrice)}
                    </td>

                    {/* 3. Quantity */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                      {pos.quantity}
                    </td>

                    {/* 4. Investment */}
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-white">
                      {formatINR(pos.investment)}
                    </td>

                    {/* 5. Portfolio % */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-gray-800 rounded-full h-1.5 hidden md:block overflow-hidden">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, pos.portfolioPercentage * 5)}%` }}
                          />
                        </div>
                        <span>{pos.portfolioPercentage.toFixed(2)}%</span>
                      </div>
                    </td>

                    {/* 6. Exchange */}
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="exchange" size="sm">
                        {pos.exchange}
                      </Badge>
                    </td>

                    {/* 7. CMP */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      {hasValidCMP ? (
                        <div>
                          <div className="font-semibold text-white">
                            {formatINR(pos.cmp)}
                          </div>
                          {pos.dayChangePercent !== null && (
                            <div
                              className={`text-[10px] flex items-center justify-end gap-0.5 ${
                                (pos.dayChangePercent || 0) >= 0
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {(pos.dayChangePercent || 0) >= 0 ? '+' : ''}
                              {pos.dayChangePercent.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>

                    {/* 8. Present Value */}
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-white">
                      {pos.presentValue !== null ? (
                        formatINR(pos.presentValue)
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>

                    {/* 9. Gain / Loss */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {pos.gainLoss !== null ? (
                        <div className="inline-flex flex-col items-end">
                          <div
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isGain ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isGain ? (
                              <TrendingUp className="h-3 w-3 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline" />
                            )}
                            <span>
                              {isGain ? '+' : ''}
                              {formatINR(pos.gainLoss)}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded mt-0.5 font-medium ${
                              isGain
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                : 'bg-rose-950/70 text-rose-300 border border-rose-800/40'
                            }`}
                          >
                            {isGain ? '↑' : '↓'} {formatPercentage(pos.gainLossPercentage)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>

                    {/* 10. P/E Ratio */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                      {pos.peRatio !== null ? (
                        <span>{formatNumber(pos.peRatio, 2)}</span>
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>

                    {/* 11. Latest Earnings */}
                    <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                      {pos.latestEarnings !== null ? (
                        <span>₹{formatNumber(pos.latestEarnings, 2)} <span className="text-[10px] text-gray-500">EPS</span></span>
                      ) : (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-gray-400 font-sans">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle className="h-8 w-8 text-gray-500 mx-auto" />
                    <p className="font-medium text-gray-300">No assets matching criteria</p>
                    <p className="text-xs text-gray-500">
                      Try adjusting your search query or selecting "All Sectors".
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
