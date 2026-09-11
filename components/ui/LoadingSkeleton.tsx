import React from 'react';
import { Card } from './Card';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading portfolio data">
      {/* Top Overview Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-32 flex flex-col justify-between">
            <div className="h-4 w-28 bg-gray-800 rounded"></div>
            <div className="h-8 w-44 bg-gray-800 rounded"></div>
            <div className="h-3 w-32 bg-gray-800/60 rounded"></div>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-80 flex flex-col justify-between">
          <div className="h-5 w-40 bg-gray-800 rounded mb-4"></div>
          <div className="h-52 w-52 bg-gray-800/50 rounded-full mx-auto"></div>
        </Card>
        <Card className="lg:col-span-2 h-80 flex flex-col justify-between">
          <div className="h-5 w-52 bg-gray-800 rounded mb-4"></div>
          <div className="h-52 w-full bg-gray-800/40 rounded"></div>
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="h-6 w-40 bg-gray-800 rounded"></div>
          <div className="h-9 w-64 bg-gray-800 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800/40">
              <div className="h-5 w-48 bg-gray-800 rounded"></div>
              <div className="h-5 w-24 bg-gray-800 rounded"></div>
              <div className="h-5 w-16 bg-gray-800 rounded"></div>
              <div className="h-5 w-28 bg-gray-800 rounded"></div>
              <div className="h-5 w-24 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
