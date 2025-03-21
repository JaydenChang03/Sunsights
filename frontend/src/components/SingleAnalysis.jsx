import React, { useState } from 'react'
import { ArrowPathIcon, ChatBubbleBottomCenterTextIcon, HeartIcon, FaceSmileIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from '../config/axios'
import useAnalyticsData from '../hooks/useAnalyticsData'

// API base URL
const API_URL = 'http://localhost:5000'

const EmotionIcon = ({ emotion }) => {
  switch(emotion) {
    case 'joy':
      return <FaceSmileIcon className="h-6 w-6 text-accent" />
    case 'love':
      return <HeartIcon className="h-6 w-6 text-pink-400" />
    case 'anger':
      return <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
    case 'neutral':
      return <QuestionMarkCircleIcon className="h-6 w-6 text-gray-400" />
    case 'surprise':
      return <SparklesIcon className="h-6 w-6 text-yellow-400" />
    case 'sadness':
      return <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-400" />
    case 'fear':
      return <ExclamationTriangleIcon className="h-6 w-6 text-purple-400" />
    default:
      return <FaceSmileIcon className="h-6 w-6 text-primary-light" />
  }
}

const PriorityBadge = ({ priority }) => {
  const colors = {
    High: 'bg-accent-dark/20 text-accent border-accent-dark/30',
    Medium: 'bg-accent/20 text-accent border-accent/30',
    Low: 'bg-primary-light/20 text-primary-light border-primary-light/30'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[priority] || 'bg-primary-light/20 text-primary-light border-primary-light/30'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </span>
  )
}

export default function SingleAnalysis() {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const { refetch: refreshAnalytics } = useAnalyticsData()

  const analyzeComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment to analyze')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`/api/analytics/analyze`, { 
        text: comment 
      })
      
      if (response.data.result) {
        // Combine the result and suggestions into a single analysis object
        const analysisData = {
          ...response.data.result,
          text: comment,
          response_suggestions: response.data.suggestions || []
        }
        setResults(analysisData)
        toast.success('Analysis completed!')
        
        // Refresh analytics data to update the emotion distribution chart
        refreshAnalytics()
      } else {
        throw new Error(response.data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Failed to analyze comment')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'POSITIVE':
        return 'text-primary-light';
      case 'NEGATIVE':
        return 'text-accent-dark';
      case 'MIXED':
        return 'text-yellow-400';
      case 'UNKNOWN':
        return 'text-gray-400';
      default:
        return 'text-cream';
    }
  }

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-primary-light/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-dark to-primary p-6 rounded-t-xl border-b border-primary-light/20">
            <div className="flex items-center">
              <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-cream" />
              <h2 className="ml-3 text-2xl font-semibold text-cream">
                Analyze Single Comment
              </h2>
            </div>
            <p className="mt-2 text-sm text-cream/80">
              Enter your comment below to analyze its sentiment, emotion, and priority level.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Input Section */}
            <div className="space-y-3">
              <label htmlFor="comment" className="block text-sm font-medium text-cream">
                Enter your comment
              </label>
              <div className="relative">
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-primary-light/20 bg-background focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors duration-200 text-cream placeholder-cream/50"
                  placeholder="Type your comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      analyzeComment();
                    }
                  }}
                />
                <div className="absolute right-3 bottom-3 text-cream/50 text-sm">
                  Press Enter to analyze, Shift+Enter for new line
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={analyzeComment}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-primary hover:bg-accent-dark focus:ring-2 focus:ring-accent-dark/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Analyzing...' : 'Analyze Comment'}
              </button>
            </div>

            {/* Results Section */}
            {results && (
              <div className="mt-8 space-y-6 bg-background/50 rounded-lg p-6 border border-primary-light/20">
                <h3 className="text-lg font-semibold text-cream">Analysis Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sentiment Card */}
                  <div className="bg-surface rounded-lg p-4 border border-primary-light/20">
                    <h4 className="text-sm font-medium text-cream/80 mb-2">Sentiment</h4>
                    <p className={`text-lg font-semibold ${getSentimentColor(results.sentiment)}`}>
                      {results.sentiment}
                      <span className="text-sm font-normal text-cream/70 ml-2">
                        ({Math.round(results.sentiment_score * 100)}%)
                      </span>
                    </p>
                  </div>

                  {/* Emotion Card */}
                  <div className="bg-surface rounded-lg p-4 border border-primary-light/20">
                    <h4 className="text-sm font-medium text-cream/80 mb-2">Emotion</h4>
                    <div className="flex items-center">
                      <EmotionIcon emotion={results.emotion} />
                      <span className="ml-2 text-lg font-semibold text-cream capitalize">
                        {results.emotion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Level */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-cream/80 mb-2">Priority Level</h4>
                  <PriorityBadge priority={results.priority} />
                </div>

                {/* Original Text */}
                <div className="mt-6 p-4 bg-surface rounded-lg border border-primary-light/20">
                  <h4 className="text-sm font-medium text-cream/80 mb-2">Analyzed Text</h4>
                  <p className="text-cream/90 text-sm italic">"{results.text}"</p>
                </div>

                {/* Response Suggestions */}
                {results.response_suggestions && results.response_suggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-cream/80 mb-3">Response Suggestions</h4>
                    <div className="space-y-2">
                      {results.response_suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-surface rounded-lg p-3 border border-primary-light/20 hover:border-accent/30 transition-colors duration-200">
                          <p className="text-cream/90 text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
