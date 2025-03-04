import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import useAnalyticsData from '../hooks/useAnalyticsData';
import FilterBar from './analytics/FilterBar';
import DrilldownModal from './analytics/DrilldownModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [drilldownData, setDrilldownData] = useState(null);
  
  const { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refetch 
  } = useAnalyticsData(timeRange);

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fefae0',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#283618',
        titleColor: '#fefae0',
        bodyColor: '#dda15e',
        borderColor: '#606c38',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(96, 108, 56, 0.2)'
        },
        ticks: { color: '#fefae0' }
      },
      y: {
        grid: {
          color: 'rgba(96, 108, 56, 0.2)'
        },
        ticks: { color: '#fefae0' }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          Error loading analytics data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-secondary">Analytics Dashboard</h1>
        </div>

        <FilterBar
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          loading={loading}
        />
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300 group">
                <h3 className="text-sm font-medium text-secondary/70">Total Analyses</h3>
                <p className="text-2xl font-bold text-accent mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.totalAnalyses.toLocaleString()}
                </p>
                <p className="text-sm text-accent/80 mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 12% from last period
                </p>
              </div>
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300 group">
                <h3 className="text-sm font-medium text-secondary/70">Average Sentiment</h3>
                <p className="text-2xl font-bold text-accent mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.averageSentiment}%
                </p>
                <p className="text-sm text-accent/80 mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 5% from last period
                </p>
              </div>
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300 group">
                <h3 className="text-sm font-medium text-secondary/70">Response Rate</h3>
                <p className="text-2xl font-bold text-accent mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.responseRate}%
                </p>
                <p className="text-sm text-accent/80 mt-2 flex items-center">
                  <span className="inline-block mr-1">↓</span> 3% from last period
                </p>
              </div>
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300 group">
                <h3 className="text-sm font-medium text-secondary/70">Avg Response Time</h3>
                <p className="text-2xl font-bold text-accent mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.responseTime}s
                </p>
                <p className="text-sm text-accent/80 mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 15% faster than last period
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sentiment Trend */}
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300">
                <h2 className="text-xl font-semibold text-secondary mb-6">Sentiment Trend</h2>
                <div className="h-80">
                  <Line data={data?.sentiment} options={chartOptions} />
                </div>
              </div>

              {/* Emotion Distribution */}
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300">
                <h2 className="text-xl font-semibold text-secondary mb-6">Emotion Distribution</h2>
                <div className="h-80">
                  <Doughnut data={data?.emotions} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300">
                <h2 className="text-xl font-semibold text-secondary mb-6">Priority Breakdown</h2>
                <div className="h-80">
                  <Bar data={data?.priority} options={chartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/20 transition-all duration-300">
                <h2 className="text-xl font-semibold text-secondary mb-6">Recent Activity</h2>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {data?.activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-primary/10 hover:border-accent/20 transition-all duration-300">
                      <div>
                        <p className="text-sm font-medium text-secondary">{activity.title}</p>
                        <p className="text-xs text-secondary/70 mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-secondary/50">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Drilldown Modal */}
        {drilldownData && (
          <DrilldownModal
            isOpen={!!drilldownData}
            onClose={() => setDrilldownData(null)}
            data={drilldownData}
            title={drilldownData.title}
            type={drilldownData.type}
          />
        )}
      </div>
    </div>
  );
}
