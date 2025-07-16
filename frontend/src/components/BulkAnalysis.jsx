import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';
import toast from 'react-hot-toast';

export default function BulkAnalysis() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [csvData, setCsvData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const fileInputRef = useRef(null);
  
  // Filter states for detailed results
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [emotionFilter, setEmotionFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Infinite scrolling state
  const [visibleItems, setVisibleItems] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const isValidType = file.type === 'text/csv' || 
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      
      // If CSV file, parse it to show column selection
      validFiles.forEach(file => {
        if (file.type === 'text/csv') {
          parseCSVFile(file);
        }
      });
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });
      
      setCsvData({ headers, data });
    };
    reader.readAsText(file);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setCsvData(null);
      setSelectedColumns([]);
    }
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      console.log('BulkAnalysis: No text files selected');
      toast.error('Please select files to upload');
      return;
    }

    console.log('BulkAnalysis: Starting file upload');
    console.log('BulkAnalysis: Files:', files);
    
    setUploading(true);
    setAnalysisProgress(0);
    
    try {
      const formData = new FormData();
      
      console.log('BulkAnalysis: Processing text files');
      // Add text files
      files.forEach(file => {
        console.log('BulkAnalysis: Adding file to FormData:', file.name, file.type);
        formData.append('file', file);
      });
      
      // Add selected columns if CSV data exists
      if (csvData && selectedColumns.length > 0) {
        console.log('BulkAnalysis: Adding selected columns:', selectedColumns);
        formData.append('columns', JSON.stringify(selectedColumns));
      }
      
      const endpoint = '/api/analytics/analyze-bulk';

      console.log('BulkAnalysis: Making request to endpoint:', endpoint);
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('BulkAnalysis: Upload progress:', percentCompleted + '%');
          setAnalysisProgress(percentCompleted);
        }
      });

      console.log('BulkAnalysis: Upload successful, response:', response.data);
      setResults(response.data);
      // Reset filters when new results are loaded
      setSentimentFilter('All');
      setEmotionFilter('All');
      setPriorityFilter('All');
      toast.success('Files uploaded and analyzed successfully!');
    } catch (error) {
      console.error('BulkAnalysis: Upload error:', error);
      console.error('BulkAnalysis: Error response:', error.response?.data);
      console.error('BulkAnalysis: Error status:', error.response?.status);
      toast.error(error.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
      setAnalysisProgress(0);
    }
  };

  const analyzeBulk = async () => {
    if (!results || !results.uploadedFiles) {
      toast.error('No files to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post('/api/analytics/analyze/process', {
        fileIds: results.uploadedFiles.map(file => file.id),
        selectedColumns
      });

      setResults(prev => ({
        ...prev,
        analysis: response.data
      }));
      
      // Reset filters and pagination when new data arrives
      resetFilters();
      
      toast.success('Bulk analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze files');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      'Positive': 'text-green-500',
      'Negative': 'text-red-500', 
      'Mixed': 'text-yellow-500'
    };
    return colors[sentiment] || 'text-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-500',
      'Medium': 'text-yellow-500',
      'Low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  // Get ordered sentiment entries
  const getOrderedSentimentEntries = (sentimentDistribution) => {
    const order = ['Negative', 'Mixed', 'Positive'];
    return order
      .filter(sentiment => sentimentDistribution.hasOwnProperty(sentiment))
      .map(sentiment => [sentiment, sentimentDistribution[sentiment]]);
  };

  // Get ordered priority entries  
  const getOrderedPriorityEntries = (priorityDistribution) => {
    const order = ['High', 'Medium', 'Low'];
    return order
      .filter(priority => priorityDistribution.hasOwnProperty(priority))
      .map(priority => [priority, priorityDistribution[priority]]);
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'text-success',
      sadness: 'text-info',
      anger: 'text-danger',
      fear: 'text-warning',
      surprise: 'text-secondary',
      love: 'text-pink-400',
      neutral: 'text-text-muted'
    };
    return colors[emotion] || 'text-text-muted';
  };

  // Helper function to get unique filter options from results
  const getFilterOptions = (results, field) => {
    if (!results || !results.results) return ['All'];
    const uniqueValues = [...new Set(results.results.map(item => item[field]))];
    return ['All', ...uniqueValues.sort()];
  };

  // Filter function for detailed results
  const getFilteredResults = () => {
    if (!results || !results.results) return [];
    
    console.log('=== BULK ANALYSIS FILTER DEBUG ===');
    console.log('Total results:', results.results.length);
    console.log('Applied filters:', { sentimentFilter, emotionFilter, priorityFilter });
    
    const filtered = results.results.filter(result => {
      const sentimentMatch = sentimentFilter === 'All' || result.sentiment === sentimentFilter;
      const emotionMatch = emotionFilter === 'All' || result.emotion === emotionFilter;
      const priorityMatch = priorityFilter === 'All' || result.priority === priorityFilter;
      
      return sentimentMatch && emotionMatch && priorityMatch;
    });
    
    console.log('Filtered results count:', filtered.length);
    console.log('Filter breakdown:', {
      sentimentOptions: getFilterOptions(results, 'sentiment'),
      emotionOptions: getFilterOptions(results, 'emotion'),
      priorityOptions: getFilterOptions(results, 'priority')
    });
    
    return filtered;
  };

  // Get visible results for infinite scrolling
  const getVisibleResults = () => {
    const filtered = getFilteredResults();
    return filtered.slice(0, visibleItems);
  };

  // Load more results automatically
  const loadMoreResults = useCallback(() => {
    if (isLoadingMore) {
      console.log('LOAD MORE DEBUG: Already loading, skipping');
      return;
    }
    
    console.log('LOAD MORE DEBUG: Starting load more', {
      currentVisibleItems: visibleItems,
      totalFilteredResults: getFilteredResults().length,
      willLoadMore: getFilteredResults().length > visibleItems
    });
    
    setIsLoadingMore(true);
    // Add a small delay to simulate loading and prevent rapid firing
    setTimeout(() => {
      setVisibleItems(prev => {
        const newCount = prev + 5;
        console.log('LOAD MORE DEBUG: Updated visible items', {
          previous: prev,
          new: newCount,
          totalAvailable: getFilteredResults().length
        });
        return newCount;
      });
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, visibleItems]);

  // Check if there are more results to load
  const hasMoreResults = () => {
    const totalResults = getFilteredResults().length;
    const hasMore = totalResults > visibleItems;
    console.log('HAS MORE RESULTS DEBUG:', {
      totalResults,
      visibleItems,
      hasMore
    });
    return hasMore;
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) {
        console.log('INFINITE SCROLL DEBUG: No container reference');
        return;
      }

      if (isLoadingMore) {
        console.log('INFINITE SCROLL DEBUG: Already loading, skipping');
        return;
      }

      if (!hasMoreResults()) {
        console.log('INFINITE SCROLL DEBUG: No more results available');
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      console.log('INFINITE SCROLL DEBUG: Scroll metrics:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isScrollable: scrollHeight > clientHeight,
        distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
        shouldTrigger: scrollTop + clientHeight >= scrollHeight - 100,
        visibleItems,
        totalResults: getFilteredResults().length
      });

      // Trigger load when user scrolls to within 100px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        console.log('INFINITE SCROLL DEBUG: Triggering load more');
        loadMoreResults();
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      console.log('INFINITE SCROLL DEBUG: Setting up scroll listener', {
        containerHeight: container.clientHeight,
        containerScrollHeight: container.scrollHeight,
        hasOverflow: container.scrollHeight > container.clientHeight
      });
      container.addEventListener('scroll', handleScroll);
      
      // Also check immediately if we need to load more (when content doesn't fill container)
      const checkInitialLoad = () => {
        const { scrollHeight, clientHeight } = container;
        console.log('INFINITE SCROLL DEBUG: Initial load check:', {
          scrollHeight,
          clientHeight,
          needsScroll: scrollHeight > clientHeight,
          hasMoreResults: hasMoreResults(),
          visibleItems,
          totalResults: getFilteredResults().length
        });
        
        // If container is not scrollable but we have more results, auto-load
        if (scrollHeight <= clientHeight && hasMoreResults() && !isLoadingMore) {
          console.log('INFINITE SCROLL DEBUG: Container not scrollable, auto-loading more items');
          loadMoreResults();
        }
      };
      
      // Check after a small delay to ensure DOM is updated
      setTimeout(checkInitialLoad, 100);
      
      return () => container.removeEventListener('scroll', handleScroll);
    } else {
      console.log('INFINITE SCROLL DEBUG: No container found for scroll listener');
    }
  }, [loadMoreResults, isLoadingMore, visibleItems, getFilteredResults]);

  // Handle filter changes - reset visible items
  const handleFilterChange = (filterType, value) => {
    setVisibleItems(5);
    if (filterType === 'sentiment') setSentimentFilter(value);
    else if (filterType === 'emotion') setEmotionFilter(value);
    else if (filterType === 'priority') setPriorityFilter(value);
  };

  // Reset all filters
  const resetFilters = () => {
    console.log('Resetting all filters');
    setSentimentFilter('All');
    setEmotionFilter('All');
    setPriorityFilter('All');
    setVisibleItems(5); // Reset to initial visible items when filters reset
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Bulk Analysis</h1>
          <p className="text-text-muted">Upload multiple CSV or Excel files for batch sentiment analysis</p>
        </div>

        {/* File Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Upload Text Files</h2>
          
          {/* File Upload Area */}
          <div
            className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 rounded-2xl transition-all duration-300 ${
              dragActive 
                ? 'bg-primary/10 ring-2 ring-primary' 
                : 'bg-bg-light/50 hover:bg-bg-light'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <div className="card absolute top-2 right-2 flex items-center px-3 py-1 z-10">
                <span className="text-xs text-text-muted">CSV, Excel supported</span>
              </div>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-primary" />
              <div className="flex text-sm text-text">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-text-muted">CSV, Excel files up to 10MB</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-text mb-3">Selected Files</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="card p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm text-text">{file.name}</span>
                      <span className="text-xs text-text-muted ml-2">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-danger hover:text-danger/80"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CSV Column Selection */}
          {csvData && (
            <div className="mt-6 card">
              <h3 className="text-lg font-medium text-text mb-3">Select Columns to Analyze</h3>
              <div className="mb-4 p-3 bg-warning/10 rounded-xl">
                <p className="text-sm text-warning">
                  Select the columns that contain text data you want to analyze for sentiment and emotion.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {csvData.headers.map((header, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(header)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns(prev => [...prev, header]);
                        } else {
                          setSelectedColumns(prev => prev.filter(col => col !== header));
                        }
                      }}
                      className="rounded text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-text">{header}</span>
                  </label>
                ))}
              </div>
              
              {/* Preview */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text mb-2">Preview</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {csvData.headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left text-xs font-medium text-text-muted">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {csvData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 text-sm text-text">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploading || (files.length === 0)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg mr-2"></div>
                  Uploading... ({analysisProgress}%)
                </div>
              ) : (
                'Upload & Analyze'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Analysis Results</h2>
              
              {results.totalAnalyzed && (
                <div className="mb-6">
                  <div className="bg-success/10 border border-primary rounded-xl p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-success mr-2" />
                      <span className="text-success font-medium">
                        Successfully analyzed {results.totalAnalyzed} items
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {results.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-text mb-3">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4">
                      <h4 className="text-sm font-medium text-text-muted mb-2">Sentiment Distribution</h4>
                      <div className="space-y-1">
                        {getOrderedSentimentEntries(results.summary.sentimentDistribution).map(([sentiment, count]) => (
                          <div key={sentiment} className="flex justify-between">
                            <span className={`text-sm ${getSentimentColor(sentiment)}`}>
                              {sentiment}
                            </span>
                            <span className="text-sm text-text">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="card p-4">
                      <h4 className="text-sm font-medium text-text-muted mb-2">Priority Distribution</h4>
                      <div className="space-y-1">
                        {getOrderedPriorityEntries(results.summary.priorityDistribution).map(([priority, count]) => (
                          <div key={priority} className="flex justify-between">
                            <span className={`text-sm ${getPriorityColor(priority)}`}>{priority}</span>
                            <span className="text-sm text-text">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="card p-4">
                      <h4 className="text-sm font-medium text-text-muted mb-2">Average Sentiment</h4>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(results.summary.averageSentiment)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.results && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-lg font-medium text-text mb-3 sm:mb-0">Detailed Results</h3>
                    <div className="text-sm text-text-muted">
                      Showing {getFilteredResults().length} of {results.results.length} results
                    </div>
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="mb-4 p-4 card">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-text">Sentiment:</label>
                        <select
                          value={sentimentFilter}
                          onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                          className="px-3 py-1 rounded-lg bg-bg border border-border text-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                        >
                          {getFilterOptions(results, 'sentiment').map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-text">Emotion:</label>
                        <select
                          value={emotionFilter}
                          onChange={(e) => handleFilterChange('emotion', e.target.value)}
                          className="px-3 py-1 rounded-lg bg-bg border border-border text-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                        >
                          {getFilterOptions(results, 'emotion').map(option => (
                            <option key={option} value={option}>
                              {option === 'All' ? option : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-text">Priority:</label>
                        <select
                          value={priorityFilter}
                          onChange={(e) => handleFilterChange('priority', e.target.value)}
                          className="px-3 py-1 rounded-lg bg-bg border border-border text-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none"
                        >
                          {getFilterOptions(results, 'priority').map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    ref={scrollContainerRef}
                    className="space-y-3 max-h-96 overflow-y-auto pr-2"
                  >
                    {getFilteredResults().length > 0 ? (
                      <>
                        {getVisibleResults().map((result, index) => (
                          <div key={index} className="card p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm text-text mb-2">{result.text}</p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className={`font-medium ${getSentimentColor(result.sentiment)}`}>
                                    {result.sentiment}
                                  </span>
                                  <span className={`${getEmotionColor(result.emotion)}`}>
                                    {result.emotion}
                                  </span>
                                  <span className="text-text-muted text-xs">
                                    Priority: <span className={`font-medium ${getPriorityColor(result.priority)}`}>{result.priority}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Loading indicator for infinite scroll */}
                        {isLoadingMore && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                              <span className="text-sm text-text-muted">Loading more...</span>
                            </div>
                          </div>
                        )}
                        
                        {!hasMoreResults() && getFilteredResults().length > 5 && (
                          <div className="text-center py-4">
                            <div className="text-sm text-text-muted">
                              Showing all {getFilteredResults().length} results
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-text-muted mb-2">No results match the selected filters</p>
                        <button
                          onClick={resetFilters}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Reset filters to view all results
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!results && (
          <div className="mt-8">
            <div className="card">
              <div className="text-center py-8">
                <p className="text-text-muted">Upload files to see analysis results</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
