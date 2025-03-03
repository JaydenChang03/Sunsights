import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';

export default function DrilldownModal({ 
  isOpen, 
  onClose, 
  data, 
  title,
  type 
}) {
  if (!isOpen) return null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9CA3AF',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#374151',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: '#4B5563',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: { color: '#9CA3AF' }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: { color: '#9CA3AF' }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400">Peak Value</h3>
              <p className="text-2xl font-semibold text-amber-400 mt-1">
                {data.stats?.peak}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400">Average</h3>
              <p className="text-2xl font-semibold text-amber-400 mt-1">
                {data.stats?.average}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400">Trend</h3>
              <p className="text-2xl font-semibold text-amber-400 mt-1">
                {data.stats?.trend}
              </p>
            </div>
          </div>

          {/* Detailed Chart */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="h-96">
              <Line data={data.chartData} options={chartOptions} />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {data.tableData?.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {row.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {row.value}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      row.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {row.change > 0 ? '+' : ''}{row.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
