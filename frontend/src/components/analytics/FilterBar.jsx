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
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-amber-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 text-gray-100 rounded-md border-gray-600 focus:border-amber-500 focus:ring-amber-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-colors duration-150"
          >
            <ArrowPathIcon 
              className={`h-4 w-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} 
            />
            <span className="ml-2 text-sm text-gray-300">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
