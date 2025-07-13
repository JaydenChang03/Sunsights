import React, { useState, useRef, useCallback } from 'react';
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
      POSITIVE: 'text-success',
      NEGATIVE: 'text-danger',
      NEUTRAL: 'text-text-muted',
      MIXED: 'text-warning'
    };
    return colors[sentiment] || 'text-text-muted';
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
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4">
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
                        {Object.entries(results.summary.sentimentDistribution).map(([sentiment, count]) => (
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
                        {Object.entries(results.summary.priorityDistribution).map(([priority, count]) => (
                          <div key={priority} className="flex justify-between">
                            <span className="text-sm text-text">{priority}</span>
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
                  <h3 className="text-lg font-medium text-text mb-3">Detailed Results</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.results.map((result, index) => (
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
                              <span className="text-text-muted">
                                Priority: {result.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
