'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SectorSummaryData } from '@/types/portfolio';
import { formatINR, formatPercentage } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface PortfolioChartsProps {
  sectors: SectorSummaryData[];
}

const SECTOR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ sectors }) => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'performance'>('allocation');

  // Format data for Sector Allocation Pie Chart
  const pieData = sectors.map((s, idx) => ({
    name: s.sector,
    value: s.totalInvestment,
    percentage: s.portfolioPercentage,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length],
  }));

  // Format data for Investment vs Present Value Bar Chart
  const barData = sectors.map((s) => ({
    sector: s.sector.length > 14 ? s.sector.substring(0, 12) + '...' : s.sector,
    fullSectorName: s.sector,
    Investment: s.totalInvestment,
    PresentValue: s.totalPresentValue,
    GainLoss: s.totalGainLoss,
    Return: s.returnPercentage,
  }));

  return (
    <Card className="p-5 border-gray-800/80 bg-gray-900/90">
      {/* Chart Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            {activeTab === 'allocation' ? (
              <PieIcon className="h-4 w-4 text-blue-400" />
            ) : (
              <BarChart3 className="h-4 w-4 text-purple-400" />
            )}
            {activeTab === 'allocation' ? 'Sector Weight Allocation' : 'Investment vs Present Value by Sector'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeTab === 'allocation'
              ? 'Portfolio diversification by industrial sector'
              : 'Capital invested compared to current market valuation'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-950 p-1 border border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'allocation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            <span>Allocation</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'performance'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Value Comparison</span>
          </button>
        </div>
      </div>

      {/* Chart Visual Content */}
      <div className="pt-4 h-72 w-full">
        {activeTab === 'allocation' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 h-full items-center">
            {/* Pie Chart Area */}
            <div className="md:col-span-2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg bg-gray-950/95 p-3 border border-gray-800 shadow-xl text-xs">
                            <div className="font-semibold text-white mb-1">{data.name}</div>
                            <div className="text-gray-300">
                              Investment: <span className="font-mono text-white">{formatINR(data.value)}</span>
                            </div>
                            <div className="text-blue-400">
                              Portfolio Weight: <span className="font-mono">{data.percentage}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-1 rounded hover:bg-gray-800/40">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-mono text-gray-400 font-medium ml-2">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis
                dataKey="sector"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatINR(val, { compact: true, decimals: 0 })}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-gray-950/95 p-3 border border-gray-800 shadow-xl text-xs space-y-1">
                        <div className="font-semibold text-white border-b border-gray-800 pb-1">{d.fullSectorName}</div>
                        <div className="flex justify-between gap-4 text-gray-300">
                          <span>Investment:</span>
                          <span className="font-mono text-white">{formatINR(d.Investment)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-purple-300">
                          <span>Present Value:</span>
                          <span className="font-mono text-white">{formatINR(d.PresentValue)}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-gray-800/60 pt-1">
                          <span>Gain/Loss:</span>
                          <span className={`font-mono ${d.GainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {d.GainLoss >= 0 ? '+' : ''}{formatINR(d.GainLoss)} ({formatPercentage(d.Return)})
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Bar dataKey="Investment" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Investment" />
              <Bar dataKey="PresentValue" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Present Value" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
