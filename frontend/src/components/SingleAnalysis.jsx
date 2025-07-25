import React, { useState } from 'react';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';
import toast from 'react-hot-toast';

// emotion icons mapping
const EmotionIcon = ({ emotion }) => {
  const icons = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    surprise: '😮',
    love: '❤️',
    neutral: '😐'
  };
  return <span className="text-2xl">{icons[emotion] || '😐'}</span>;
};

// priority badge component
const PriorityBadge = ({ priority }) => {
  const colors = {
    High: 'bg-danger/20 text-danger',
    Medium: 'bg-warning/20 text-warning',
    Low: 'bg-success/20 text-success',
    high: 'bg-danger/20 text-danger',
    medium: 'bg-warning/20 text-warning',
    low: 'bg-success/20 text-success'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[priority] || 'bg-primary/20 text-primary'}`}>
      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Unknown'} Priority
    </span>
  );
};

export default function SingleAnalysis() {
  const [comment, setComment] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/analytics/analyze', {
        text: comment
      });
      
      // check if response.data has result property
      if (response.data.result) {
        setResult(response.data.result);
      } else {
        setResult(response.data);
      }
      
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing comment:', error);
      toast.error('Failed to analyze comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      POSITIVE: 'text-success',
      NEGATIVE: 'text-danger',
      NEUTRAL: 'text-text-muted',
      MIXED: 'text-warning'
    };
    return colors[sentiment] || 'text-text-muted';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      analyzeComment();
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Single Analysis</h1>
          <p className="text-text-muted">Analyze individual comments for sentiment, emotion, and priority assessment</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Analyze Comment</h2>
          
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-text mb-2">
                Comment Text
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your comment here... (Ctrl+Enter to analyze)"
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-bg backdrop-blur-sm focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all duration-200 text-text placeholder-text-muted border-0 focus:bg-bg-light/50"
              />
              <p className="mt-2 text-sm text-text-muted">
                Press Ctrl+Enter to analyze or use the button below
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={analyzeComment}
                disabled={loading || !comment.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Analysis Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sentiment Analysis */}
                <div className="card p-4">
                  <h4 className="font-medium text-text mb-3">Sentiment Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Sentiment:</span>
                      <span className={`font-medium ${getSentimentColor(result.sentiment)}`}>
                        {result.sentiment}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Score:</span>
                      <span className="font-medium text-text">
                        {Math.round(result.sentiment_score)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emotion Analysis */}
                <div className="card p-4">
                  <h4 className="font-medium text-text mb-3">Emotion Analysis</h4>
                  <div className="flex items-center space-x-3">
                    <EmotionIcon emotion={result.emotion} />
                    <div>
                      <p className="font-medium text-text">
                        {result.emotion ? result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Level */}
              <div className="card p-4 mt-6">
                <h4 className="font-medium text-text mb-3">Priority Assessment</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted">Priority Level:</p>
                    <p className="text-sm text-text-muted mt-1">
                      Based on sentiment intensity and emotional content
                    </p>
                  </div>
                  <PriorityBadge priority={result.priority} />
                </div>
              </div>

              {/* Additional Insights */}
              {result.insights && result.insights.length > 0 && (
                <div className="card p-4 mt-6">
                  <h4 className="font-medium text-text mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="card p-3 text-sm">
                        <span className="text-text">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
