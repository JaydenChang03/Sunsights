import React from 'react';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function FilterBar({ 
  timeRange, 
  setTimeRange, 
  lastUpdated,
  onRefresh,
  loading 
}) {
  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="bg-bg-light/50 backdrop-blur-sm rounded-2xl p-4 border border-primary mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-primary" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-bg border border-border-muted rounded-xl px-4 py-2 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value} className="bg-bg text-text">
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-muted">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowPathIcon 
              className={`h-4 w-4 text-bg ${loading ? 'animate-spin' : ''}`} 
            />
            <span className="ml-2 text-sm text-bg font-medium">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
