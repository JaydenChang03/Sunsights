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
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageAnalysisType, setImageAnalysisType] = useState('general');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [csvData, setCsvData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [analysisType, setAnalysisType] = useState('text');
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type.startsWith('image/');
      
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

  const handleImageInput = (e) => {
    const imageFiles = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (analysisType === 'text' && files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    if (analysisType === 'image' && selectedImages.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);
    setAnalysisProgress(0);
    
    try {
      const formData = new FormData();
      let endpoint = '';
      
      if (analysisType === 'text') {
        // Add text files
        files.forEach(file => {
          formData.append('file', file);
        });
        
        // Add selected columns if CSV data exists
        if (csvData && selectedColumns.length > 0) {
          formData.append('columns', JSON.stringify(selectedColumns));
        }
        
        endpoint = '/api/analyze-bulk';
      } else if (analysisType === 'image') {
        // Add images
        selectedImages.forEach(image => {
          formData.append('images', image);
        });
        
        // Add image analysis type
        formData.append('analysis_type', imageAnalysisType);
        
        endpoint = '/api/analyze-images';
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setAnalysisProgress(percentCompleted);
        }
      });

      setResults(response.data);
      toast.success(`${analysisType === 'text' ? 'Files' : 'Images'} uploaded and analyzed successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || `Failed to upload ${analysisType === 'text' ? 'files' : 'images'}`);
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
      const response = await axios.post('/api/analyze/process', {
        fileIds: results.uploadedFiles.map(file => file.id),
        analysisType,
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
          <p className="text-text-muted">Upload multiple files or images for batch sentiment analysis</p>
        </div>

        {/* Analysis Type Selection */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">Analysis Type</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setAnalysisType('text')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                analysisType === 'text' 
                  ? 'bg-primary text-bg' 
                  : 'bg-bg-light/50 text-text hover:bg-bg-light'
              }`}
            >
              Text Analysis
            </button>
            <button
              onClick={() => setAnalysisType('image')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                analysisType === 'image' 
                  ? 'bg-primary text-bg' 
                  : 'bg-bg-light/50 text-text hover:bg-bg-light'
              }`}
            >
              Image Analysis
            </button>
          </div>
        </div>

        {analysisType === 'text' ? (
          // Text Analysis Section
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
        ) : (
          // Image Analysis Section
          <div className="card">
            <h2 className="text-xl font-semibold text-text mb-4">Upload Images</h2>
            
            {/* Image Analysis Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-2">
                Analysis Type
              </label>
              <select
                value={imageAnalysisType}
                onChange={(e) => setImageAnalysisType(e.target.value)}
                className="input-field"
              >
                <option value="general">General Image Analysis</option>
                <option value="text">Text Recognition (OCR)</option>
                <option value="emotion">Facial Emotion Detection</option>
                <option value="object">Object Detection</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageInput}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="btn-primary"
              >
                Select Images
              </button>
            </div>

            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-text mb-3">Selected Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative card p-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-danger text-bg rounded-full p-1 hover:bg-danger/80"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-text-muted mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading || selectedImages.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg mr-2"></div>
                    Analyzing... ({analysisProgress}%)
                  </div>
                ) : (
                  'Upload & Analyze Images'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="mt-8 card">
            <h2 className="text-xl font-semibold text-text mb-4">Analysis Results</h2>
            
            {results.analysis ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.analysis.totalItems ? (
                    // Text Analysis Summary
                    <>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-text">{results.analysis.totalItems}</div>
                        <div className="text-text-muted">Total Items</div>
                      </div>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-success">{results.analysis.positiveCount}</div>
                        <div className="text-text-muted">Positive</div>
                      </div>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-danger">{results.analysis.negativeCount}</div>
                        <div className="text-text-muted">Negative</div>
                      </div>
                    </>
                  ) : (
                    // Image Analysis Summary
                    <>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-text">{results.analysis.totalImages}</div>
                        <div className="text-text-muted">Total Images</div>
                      </div>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-success">{results.analysis.processedImages}</div>
                        <div className="text-text-muted">Processed</div>
                      </div>
                      <div className="card p-4 text-center">
                        <div className="text-2xl font-bold text-danger">{results.analysis.errorCount}</div>
                        <div className="text-text-muted">Errors</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  {results.analysis.items ? (
                    // Text Analysis Results
                    results.analysis.items.map((item, index) => (
                      <div key={index} className="card p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-text font-medium">{item.text}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`text-sm ${getSentimentColor(item.sentiment)}`}>
                                {item.sentiment}
                              </span>
                              <span className={`text-sm ${getEmotionColor(item.emotion)}`}>
                                {item.emotion}
                              </span>
                              <span className="text-sm text-text-muted">
                                {Math.round(item.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : results.analysis.results ? (
                    // Image Analysis Results
                    results.analysis.results.map((result, index) => (
                      <div key={index} className="card p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="text-text font-medium mb-2">{result.filename}</h4>
                            {result.error ? (
                              <p className="text-danger text-sm">{result.error}</p>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm text-text-muted">
                                    Analysis: {result.analysis_type}
                                  </span>
                                  <span className="text-sm text-text-muted">
                                    Size: {Math.round(result.file_size / 1024)} KB
                                  </span>
                                </div>
                                
                                {result.analysis_type === 'general' && (
                                  <div className="text-sm text-text">
                                    <p><strong>Description:</strong> {result.analysis.description}</p>
                                    <p><strong>Objects:</strong> {result.analysis.objects.join(', ')}</p>
                                    <p><strong>Colors:</strong> {result.analysis.colors.join(', ')}</p>
                                  </div>
                                )}
                                
                                {result.analysis_type === 'text' && (
                                  <div className="text-sm text-text">
                                    <p><strong>Extracted Text:</strong> {result.analysis.extracted_text}</p>
                                    <div className="mt-2 flex items-center space-x-4">
                                      <span className={`${getSentimentColor(result.analysis.text_analysis.sentiment)}`}>
                                        {result.analysis.text_analysis.sentiment}
                                      </span>
                                      <span className={`${getEmotionColor(result.analysis.text_analysis.emotion)}`}>
                                        {result.analysis.text_analysis.emotion}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {result.analysis_type === 'emotion' && (
                                  <div className="text-sm text-text">
                                    <p><strong>Faces Detected:</strong> {result.analysis.faces_detected}</p>
                                    <p><strong>Primary Emotion:</strong> {result.analysis.primary_emotion}</p>
                                  </div>
                                )}
                                
                                {result.analysis_type === 'object' && (
                                  <div className="text-sm text-text">
                                    <p><strong>Objects Detected:</strong> {result.analysis.objects_detected}</p>
                                    <p><strong>Objects:</strong> {result.analysis.objects.map(obj => obj.name).join(', ')}</p>
                                  </div>
                                )}
                                
                                <div className="text-xs text-text-muted">
                                  Confidence: {Math.round(result.analysis.confidence * 100)}%
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted">Upload {analysisType === 'text' ? 'files' : 'images'} to see analysis results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
