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
    <div className="bg-surface rounded-lg p-4 border border-primary/10 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-accent" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="analytics-filter-dropdown bg-background text-secondary rounded-md border-primary/20 focus:border-accent focus:ring-accent"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-secondary/70">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-primary/80 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-colors duration-150"
          >
            <ArrowPathIcon 
              className={`h-4 w-4 text-secondary ${loading ? 'animate-spin' : ''}`} 
            />
            <span className="ml-2 text-sm text-secondary">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
