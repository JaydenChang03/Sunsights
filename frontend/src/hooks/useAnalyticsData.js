import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function useAnalyticsData(timeRange = '7d', category = 'all') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch data based on time range and category
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { range: timeRange, category };
      
      const [sentiment, emotions, priority, activity] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/sentiment`, { params }),
        axios.get(`${API_URL}/api/analytics/emotions`, { params }),
        axios.get(`${API_URL}/api/analytics/priority`, { params }),
        axios.get(`${API_URL}/api/analytics/activity`, { params })
      ]);

      setData({
        sentiment: sentiment.data,
        emotions: emotions.data,
        priority: priority.data,
        activity: activity.data,
        summary: {
          totalAnalyses: 1234,
          averageSentiment: 76,
          responseRate: 92,
          responseTime: 2.4
        }
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [timeRange, category]);

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, category]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
