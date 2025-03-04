import { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';

export default function useAnalyticsData(timeRange = '7d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch data based on time range
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the proper axios instance with authentication
      const params = { range: timeRange };
      
      // Use Promise.all to fetch all data in parallel
      const [
        summaryResponse,
        sentimentResponse, 
        emotionsResponse, 
        priorityResponse, 
        activityResponse
      ] = await Promise.all([
        axios.get(`/api/analytics/summary`, { params }),
        axios.get(`/api/analytics/sentiment`, { params }),
        axios.get(`/api/analytics/emotions`, { params }),
        axios.get(`/api/analytics/priority`, { params }),
        axios.get(`/api/analytics/activity`, { params })
      ]);

      // Use the actual data from the API instead of hardcoded values
      setData({
        sentiment: sentimentResponse.data,
        emotions: emotionsResponse.data,
        priority: priorityResponse.data,
        activity: activityResponse.data,
        summary: summaryResponse.data || {
          totalAnalyses: 0,
          averageSentiment: 0,
          responseRate: 0,
          responseTime: 0
        }
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to fetch analytics data');
      
      // Keep any existing data if there's an error
      if (!data) {
        setData({
          sentiment: { labels: [], datasets: [] },
          emotions: { labels: [], datasets: [] },
          priority: { labels: [], datasets: [] },
          activity: [],
          summary: {
            totalAnalyses: 0,
            averageSentiment: 0,
            responseRate: 0,
            responseTime: 0
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling for real-time updates (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
