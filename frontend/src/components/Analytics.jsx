import React, { useState, useContext } from 'react';
import { ThemeContext } from '../App';
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
  const { darkMode } = useContext(ThemeContext);
  
  const { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refetch 
  } = useAnalyticsData(timeRange);

  // Chart configuration with theme-aware colors
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'hsl(220, 100%, 98%)' : 'hsl(220, 100%, 2%)',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: darkMode ? 'hsl(220, 35%, 10%)' : 'hsl(220, 35%, 90%)',
        titleColor: darkMode ? 'hsl(220, 100%, 98%)' : 'hsl(220, 100%, 2%)',
        bodyColor: darkMode ? 'hsl(40, 53%, 60%)' : 'hsl(40, 53%, 40%)',
        borderColor: darkMode ? 'hsl(220, 78%, 76%)' : 'hsl(220, 78%, 24%)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(220, 78, 76, 0.1)' : 'rgba(96, 108, 56, 0.1)'
        },
        ticks: { color: darkMode ? 'hsl(220, 100%, 98%)' : 'hsl(220, 100%, 2%)' }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(220, 78, 76, 0.1)' : 'rgba(96, 108, 56, 0.1)'
        },
        ticks: { color: darkMode ? 'hsl(220, 100%, 98%)' : 'hsl(220, 100%, 2%)' }
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
      <div className="p-6 bg-bg min-h-screen">
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger backdrop-blur-sm">
          Error loading analytics data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg min-h-screen">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-text-muted">Total Analyses</h3>
                <p className="text-2xl font-bold text-text mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.totalAnalyses.toLocaleString()}
                </p>
                <p className="text-sm text-success mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 12% from last period
                </p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-text-muted">Average Sentiment</h3>
                <p className="text-2xl font-bold text-text mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.averageSentiment ? data.summary.averageSentiment.toFixed(2) : '0.00'}%
                </p>
                <p className="text-sm text-success mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 5% from last period
                </p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-text-muted">Response Rate</h3>
                <p className="text-2xl font-bold text-text mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.responseRate}%
                </p>
                <p className="text-sm text-danger mt-2 flex items-center">
                  <span className="inline-block mr-1">↓</span> 3% from last period
                </p>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-text-muted">Avg Response Time</h3>
                <p className="text-2xl font-bold text-text mt-2 group-hover:scale-105 transition-transform">
                  {data?.summary.responseTime}s
                </p>
                <p className="text-sm text-success mt-2 flex items-center">
                  <span className="inline-block mr-1">↑</span> 15% faster than last period
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sentiment Trend */}
              <div className="card">
                <h2 className="text-xl font-semibold text-text mb-6">Sentiment Trend</h2>
                <div className="h-80">
                  <Line data={data?.sentiment} options={chartOptions} />
                </div>
              </div>

              {/* Emotion Distribution */}
              <div className="card">
                <h2 className="text-xl font-semibold text-text mb-6">Emotion Distribution</h2>
                <div className="h-80">
                  <Doughnut data={data?.emotions} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'right',
                        labels: {
                          ...chartOptions.plugins.legend.labels,
                          color: darkMode ? 'hsl(220, 100%, 98%)' : 'hsl(220, 100%, 2%)'
                        }
                      },
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    // Fix tooltip hover issue by disabling hover mode
                    hover: {
                      mode: null
                    },
                    // Ensure tooltips are accurate
                    interaction: {
                      mode: 'point',
                      intersect: true
                    }
                  }} />
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="card">
                <h2 className="text-xl font-semibold text-text mb-6">Priority Breakdown</h2>
                <div className="h-80">
                  <Bar data={data?.priority} options={chartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h2 className="text-xl font-semibold text-text mb-6">Recent Activity</h2>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {data?.activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-bg/50 backdrop-blur-sm rounded-xl border-0 hover:border hover:border-primary/10 transition-all duration-300 hover:shadow-md">
                      <div>
                        <p className="text-sm font-medium text-text">{activity.title}</p>
                        <p className="text-xs text-text-muted mt-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-text-muted/70">{activity.time}</span>
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
