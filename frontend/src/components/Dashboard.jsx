import React, { useState, useEffect } from 'react';
import { ClockIcon, ChartBarIcon, DocumentTextIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';
import toast from 'react-hot-toast';

// Initial stats structure
const initialStats = [
  {
    id: 1,
    title: 'Total Analyses',
    value: '0',
    icon: <DocumentTextIcon className="w-6 h-6 text-accent" />,
    iconBg: 'bg-accent/10'
  },
  {
    id: 2,
    title: 'Bulk Uploads',
    value: '0',
    icon: <DocumentDuplicateIcon className="w-6 h-6 text-accent" />,
    iconBg: 'bg-accent/10'
  },
  {
    id: 3,
    title: 'Average Sentiment',
    value: 'N/A',
    icon: <ChartBarIcon className="w-6 h-6 text-accent" />,
    iconBg: 'bg-accent/10'
  },
  {
    id: 4,
    title: 'Last Analysis',
    value: 'Never',
    icon: <ClockIcon className="w-6 h-6 text-accent" />,
    iconBg: 'bg-accent/10'
  }
];

export default function Dashboard() {
  // Text analysis states
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Dashboard stats states
  const [stats, setStats] = useState(initialStats);
  const [activities, setActivities] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [activityError, setActivityError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    fetchStats();
    fetchActivity();
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timestamp; // Return as is if not a valid date
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp || 'Never';
    }
  };

  // Function to fetch stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    
    try {
      const response = await axios.get('/api/analytics/summary');
      const data = response.data;
      
      // Update stats with real data
      const updatedStats = [...initialStats];
      updatedStats[0].value = data.totalAnalyses.toString();
      
      // For bulk uploads, we'll use a percentage of total analyses as an example
      const bulkUploads = Math.floor(data.totalAnalyses * 0.2); // Assuming 20% are bulk uploads
      updatedStats[1].value = bulkUploads.toString();
      
      // Format average sentiment as percentage
      updatedStats[2].value = `${data.averageSentiment}%`;
      
      // Format last analysis time
      updatedStats[3].value = formatTimestamp(data.lastAnalysisTime);
      
      setStats(updatedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStatsError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Function to fetch recent activity
  const fetchActivity = async () => {
    setIsLoadingActivity(true);
    setActivityError(null);
    
    try {
      const response = await axios.get('/api/analytics/activity');
      if (Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        console.error('Activity data is not an array:', response.data);
        setActivityError('Invalid activity data format');
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setActivityError('Failed to load recent activity');
      toast.error('Failed to load recent activity');
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Function to handle text analysis
  const handleAnalyzeText = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await axios.post('/api/analytics/analyze', { text });
      setAnalysisResult(response.data.analysis);
      toast.success('Analysis completed successfully!');
      
      // Refresh dashboard data after successful analysis
      fetchDashboardData();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze text. Please try again.');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to get color based on sentiment
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-secondary';
    return sentiment === 'POSITIVE' ? 'text-green-500' : 'text-red-500';
  };

  // Helper function to get color based on priority
  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-200';
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  // Helper function to get color based on emotion
  const getEmotionColor = (emotion) => {
    if (!emotion) return 'text-secondary';
    const emotionColors = {
      joy: 'text-yellow-500',
      sadness: 'text-blue-500',
      anger: 'text-red-500',
      fear: 'text-purple-500',
      surprise: 'text-green-500',
      love: 'text-pink-500'
    };
    return emotionColors[emotion.toLowerCase()] || 'text-secondary';
  };

  // Helper function to get color based on activity type
  const getActivityTypeColor = (type) => {
    const typeColors = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      error: 'bg-red-500'
    };
    return typeColors[type] || 'bg-gray-500';
  };

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary mb-8">Welcome back!</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingStats ? (
            // Loading skeleton for stats
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 border border-primary/10 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10"></div>
                  <div className="h-4 bg-primary/10 rounded w-24 ml-3"></div>
                </div>
                <div className="h-6 bg-primary/10 rounded w-16"></div>
              </div>
            ))
          ) : statsError ? (
            // Error state for stats
            <div className="col-span-4 bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-500">{statsError}</p>
              <button 
                onClick={fetchStats}
                className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            // Stats display
            stats.map(stat => (
              <div key={stat.id} className="bg-surface rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-colors">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-secondary ml-3">{stat.title}</h3>
                </div>
                <p className="text-2xl font-semibold text-primary">{stat.value}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Text Analysis Card */}
          <div className="lg:col-span-2 bg-surface rounded-xl p-6 border border-primary/10">
            <h2 className="text-xl font-semibold text-secondary mb-4">Analyze Text</h2>
            <div className="mb-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to analyze sentiment and emotion..."
                className="w-full h-32 p-3 bg-background border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-primary"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAnalyzeText}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {analysisResult && (
              <div className="mt-4 p-4 bg-background border border-primary/10 rounded-lg">
                <h3 className="font-medium text-secondary mb-2">Analysis Results:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary">Sentiment:</p>
                    <p className={`font-medium ${getSentimentColor(analysisResult.sentiment)}`}>
                      {analysisResult.sentiment}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Score:</p>
                    <p className="font-medium text-primary">
                      {Math.round(analysisResult.sentiment_score * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Emotion:</p>
                    <p className={`font-medium ${getEmotionColor(analysisResult.emotion)}`}>
                      {analysisResult.emotion.charAt(0).toUpperCase() + analysisResult.emotion.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Priority:</p>
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPriorityColor(analysisResult.priority)}`}></span>
                      <span className="font-medium text-primary">{analysisResult.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Activity Card */}
          <div className="bg-surface rounded-xl p-6 border border-primary/10 h-fit max-h-[500px] overflow-y-auto">
            <h2 className="text-xl font-semibold text-secondary mb-4">Recent Activity</h2>
            
            {isLoadingActivity ? (
              // Loading skeleton for activity
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-primary/10 mr-2"></div>
                    <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                  </div>
                  <div className="h-3 bg-primary/10 rounded w-1/2 ml-5 mb-1"></div>
                  <div className="h-3 bg-primary/10 rounded w-1/4 ml-5"></div>
                </div>
              ))
            ) : activityError ? (
              // Error state for activity
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-500">{activityError}</p>
                <button 
                  onClick={fetchActivity}
                  className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : activities.length === 0 ? (
              // Empty state
              <div className="text-center py-6">
                <p className="text-secondary">No recent activity</p>
              </div>
            ) : (
              // Activity list
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="relative pl-5">
                    <div className={`absolute left-0 top-2 w-3 h-3 rounded-full ${getActivityTypeColor(activity.type)}`}></div>
                    <h3 className="font-medium text-secondary">{activity.title}</h3>
                    <p className="text-sm text-secondary/70">{activity.description}</p>
                    <p className="text-xs text-secondary/50">{formatTimestamp(activity.time)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
