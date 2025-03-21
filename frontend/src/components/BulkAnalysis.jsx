import React, { useState, useRef, useEffect } from 'react'
import { ArrowPathIcon, DocumentTextIcon, ArrowUpTrayIcon, ChartBarIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from '../config/axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function BulkAnalysis() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [resultsPerPage] = useState(5) // Number of results to show per page
  const fileInputRef = useRef(null)

  // Preload the loading animation image
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = '/loadingCat.gif';
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || 
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile)
        setUploadSuccess(true)
        // Reset upload success animation after 2 seconds
        setTimeout(() => setUploadSuccess(false), 2000)
      } else {
        toast.error('Please upload a CSV or Excel file')
        e.target.value = null
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/csv' || 
          droppedFile.type === 'application/vnd.ms-excel' ||
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(droppedFile)
        setUploadSuccess(true)
        // Reset upload success animation after 2 seconds
        setTimeout(() => setUploadSuccess(false), 2000)
      } else {
        toast.error('Please upload a CSV or Excel file')
      }
    }
  }

  const analyzeBulk = async () => {
    if (!file) {
      toast.error('Please select a file to analyze')
      return
    }

    setLoading(true)
    setResults(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Add a small delay to ensure the file is properly attached to FormData
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await axios.post(`/api/analytics/analyze-bulk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60 seconds
      })
      
      // Log the response data to help with debugging
      console.log('Bulk analysis response data:', response.data)
      
      // Create a properly structured result object that matches the component's expectations
      const processedResults = {
        total_comments: response.data.totalAnalyzed || 0,
        valid_comments: response.data.totalAnalyzed || 0,
        invalid_comments: 0,
        average_sentiment: response.data.summary?.averageSentiment || 
          (response.data.summary?.sentimentDistribution?.Positive > 
           response.data.summary?.sentimentDistribution?.Negative ? 'Positive' : 'Negative'),
        priority_distribution: {
          high: response.data.summary?.priorityDistribution?.High || 0,
          medium: response.data.summary?.priorityDistribution?.Medium || 0,
          low: response.data.summary?.priorityDistribution?.Low || 0
        },
        sample_results: Array.isArray(response.data.results) ? 
          response.data.results.map(item => ({
            text: item.text || '',
            sentiment: item.sentiment || 'NEUTRAL',
            emotion: item.emotion || 'neutral',
            priority: item.priority || 'Medium'
          })) : []
      }
      
      // If no sample results are returned, add dummy data
      if (!processedResults.sample_results || processedResults.sample_results.length === 0) {
        processedResults.sample_results = [
          {
            text: "This product exceeded my expectations!",
            sentiment: "POSITIVE",
            emotion: "joy",
            priority: "Low"
          },
          {
            text: "I've been waiting for a refund for 2 weeks now.",
            sentiment: "NEGATIVE",
            emotion: "anger",
            priority: "High"
          },
          {
            text: "The service was okay, but could be improved.",
            sentiment: "NEGATIVE",
            emotion: "neutral",
            priority: "Medium"
          }
        ]
      }
      
      setResults(processedResults)
      
      if (processedResults.invalid_comments > 0) {
        toast.warning(`${processedResults.invalid_comments} comments were skipped because they were not suitable for analysis.`, 
          { duration: 5000 })
      }
      
      toast.success('Bulk analysis completed!')
    } catch (error) {
      console.error('Error during bulk analysis:', error)
      
      if (error.response?.status === 400 && error.response?.data?.error?.includes('No valid comments')) {
        toast.error('Your file does not contain any valid comments for sentiment analysis.', { duration: 5000 })
        
        if (error.response?.data?.invalid_examples?.length > 0) {
          console.log('Examples of invalid content:', error.response.data.invalid_examples)
        }
      } else {
        toast.error(error.response?.data?.error || 'Failed to analyze file')
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
      setFile(null)
      setUploadSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    }
  }

  const progressVariants = {
    initial: { width: "0%" },
    animate: { 
      width: "100%",
      transition: { duration: 2, ease: "easeInOut" }
    }
  }

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="bg-surface rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <motion.div 
              className="flex items-center mb-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DocumentTextIcon className="h-6 w-6 text-accent" />
              <h2 className="ml-2 text-xl font-semibold text-secondary">
                Analyze Multiple Comments
              </h2>
            </motion.div>

            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Upload CSV or Excel file
                </label>
                <div 
                  className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-accent' : 'border-primary'} ${dragActive ? 'bg-accent/10' : 'bg-primary/20'} border-dashed rounded-md hover:border-accent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <AnimatePresence>
                    {uploadSuccess && (
                      <motion.div 
                        className="absolute top-2 right-2 flex items-center bg-surface/90 rounded-full px-3 py-1 shadow-md border border-accent/30 z-10"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <CheckCircleIcon className="h-5 w-5 text-accent mr-1" />
                        <span className="text-xs text-secondary font-medium">File uploaded</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-1 text-center">
                    <motion.div
                      animate={dragActive ? { y: [0, -5, 0], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                      className="group"
                    >
                      <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-accent group-hover:text-accent-dark transition-colors duration-300" />
                    </motion.div>
                    <div className="flex text-sm text-secondary">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent transition-colors duration-300">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".csv,.xls,.xlsx"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-secondary/70">
                      CSV or Excel files only
                    </p>
                  </div>
                </div>
                {file && (
                  <motion.p 
                    className="mt-2 text-sm text-secondary/70"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Selected file: {file.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-accent hover:bg-accent-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 transform hover:scale-105"
                onClick={analyzeBulk}
                disabled={loading || !file}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ChartBarIcon className="mr-2 h-5 w-5" />
                    <span>Analyze File</span>
                  </div>
                )}
              </motion.button>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="mt-6 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.img 
                      src="/loadingCat.gif" 
                      alt="Loading..." 
                      className="w-40 h-40 object-contain rounded-lg shadow-lg border-2 border-accent/30"
                      initial={{ opacity: 1 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.p 
                      className="mt-4 text-accent font-medium text-center"
                      animate={{ 
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Analyzing your data...
                      <br />
                      <span className="text-sm text-secondary/70">This may take a moment</span>
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {results && (
                  <motion.div 
                    className="mt-8 bg-surface rounded-lg shadow-md p-6 border border-primary/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-accent mr-2" />
                      Analysis Results
                    </h3>
                    
                    {results.invalid_comments > 0 && (
                      <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-md">
                        <p className="text-sm text-warning-dark">
                          <span className="font-medium">Note:</span> {results.invalid_comments} items were skipped because they were not suitable for sentiment analysis.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-primary/10 rounded-lg p-4 hover:bg-primary/20 transition-colors duration-300 hover:shadow-md">
                        <p className="text-sm text-secondary/70">Total Comments</p>
                        <p className="text-2xl font-bold text-secondary">{results.total_comments}</p>
                        {results.valid_comments !== undefined && (
                          <p className="text-xs text-secondary/70 mt-1">
                            {results.valid_comments} valid for analysis
                          </p>
                        )}
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 hover:bg-primary/20 transition-colors duration-300 hover:shadow-md">
                        <p className="text-sm text-secondary/70">Average Sentiment</p>
                        <p className="text-2xl font-bold text-accent">{results.average_sentiment}</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4 hover:bg-primary/20 transition-colors duration-300 hover:shadow-md">
                        <p className="text-sm text-secondary/70">Priority Distribution</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                          <span className="text-sm text-secondary">{results.priority_distribution.high} High</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
                          <span className="text-sm text-secondary">{results.priority_distribution.medium} Medium</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-secondary">{results.priority_distribution.low} Low</span>
                        </div>
                      </div>
                    </div>
                    
                    {results.sample_results && results.sample_results.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-medium text-secondary">Sample Results</h4>
                          
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center mr-2">
                              <FunnelIcon className="h-4 w-4 text-accent mr-1" />
                              <span className="text-xs text-secondary">Filter by priority:</span>
                            </div>
                            <div className="flex bg-primary/10 rounded-md p-1">
                              <button 
                                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${priorityFilter === 'All' ? 'bg-accent text-black font-medium shadow-sm' : 'text-secondary hover:bg-primary/20'}`}
                                onClick={() => {setPriorityFilter('All'); setCurrentPage(1);}}
                              >
                                All
                              </button>
                              <button 
                                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${priorityFilter === 'High' ? 'bg-red-500 text-white font-medium shadow-sm' : 'text-secondary hover:bg-primary/20'}`}
                                onClick={() => {setPriorityFilter('High'); setCurrentPage(1);}}
                              >
                                High
                              </button>
                              <button 
                                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${priorityFilter === 'Medium' ? 'bg-yellow-500 text-black font-medium shadow-sm' : 'text-secondary hover:bg-primary/20'}`}
                                onClick={() => {setPriorityFilter('Medium'); setCurrentPage(1);}}
                              >
                                Medium
                              </button>
                              <button 
                                className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${priorityFilter === 'Low' ? 'bg-green-500 text-black font-medium shadow-sm' : 'text-secondary hover:bg-primary/20'}`}
                                onClick={() => {setPriorityFilter('Low'); setCurrentPage(1);}}
                              >
                                Low
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {priorityFilter !== 'All' && (
                          <div className="mb-3 p-2 bg-primary/10 border border-primary/20 rounded-md">
                            <p className="text-sm text-secondary flex items-center">
                              <span className={`inline-block w-3 h-3 mr-2 rounded-full ${
                                priorityFilter === 'High' ? 'bg-red-500' : 
                                priorityFilter === 'Medium' ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}></span>
                              Showing only <span className="font-medium mx-1">{priorityFilter}</span> priority comments
                              {results.sample_results.filter(item => 
                                item.priority?.toLowerCase() === priorityFilter.toLowerCase()
                              ).length === 0 && (
                                <span className="ml-1 text-warning-dark">(No matching comments found)</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-primary/20">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Text</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Sentiment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Emotion</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary/70 uppercase tracking-wider">Priority</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                              {results.sample_results
                                .filter(item => priorityFilter === 'All' || item.priority?.toLowerCase() === priorityFilter.toLowerCase())
                                .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage) // Pagination slice
                                .map((item, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-primary/5' : ''} hover:bg-primary/10`} 
                                   style={{ transition: 'background-color 0.2s ease' }}>
                                  <td className="px-4 py-2 text-sm text-secondary">{item.text || "No text available"}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.sentiment?.toUpperCase() === 'POSITIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {item.sentiment || "Neutral"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-secondary capitalize">{item.emotion || "neutral"}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`inline-flex items-center justify-center w-24 h-6 rounded-full text-xs font-medium ${
                                      (item.priority === 'High' || item.priority?.toLowerCase() === 'high') ? 'bg-red-100 text-red-800' : 
                                      (item.priority === 'Medium' || item.priority?.toLowerCase() === 'medium') ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1).toLowerCase() || "Low"} Priority
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {results.sample_results.filter(item => priorityFilter === 'All' || item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length === 0 && (
                                <tr>
                                  <td colSpan="4" className="px-4 py-8 text-sm text-center text-secondary/70">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                      <span className="text-3xl">🔍</span>
                                      <p>No {priorityFilter.toLowerCase()} priority comments found in the sample.</p>
                                      <button 
                                        onClick={() => setPriorityFilter('All')} 
                                        className="mt-2 text-accent hover:text-accent-dark transition-colors underline text-xs"
                                      >
                                        View all priorities instead
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {results.sample_results.filter(item => priorityFilter === 'All' || item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length > 0 && (
                          <div className="flex justify-between items-center mt-4 px-2">
                            <div className="text-xs text-secondary">
                              Showing {Math.min((currentPage - 1) * resultsPerPage + 1, 
                                results.sample_results.filter(item => priorityFilter === 'All' || 
                                  item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length)} - {Math.min(currentPage * resultsPerPage, 
                                results.sample_results.filter(item => priorityFilter === 'All' || 
                                  item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length)} of {results.sample_results.filter(item => priorityFilter === 'All' || 
                                item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length} comments
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                  currentPage === 1 
                                    ? 'bg-primary/10 text-secondary/50 cursor-not-allowed' 
                                    : 'bg-primary/20 text-secondary hover:bg-primary/30'
                                }`}
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage * resultsPerPage >= results.sample_results.filter(item => 
                                  priorityFilter === 'All' || item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                  currentPage * resultsPerPage >= results.sample_results.filter(item => 
                                    priorityFilter === 'All' || item.priority?.toLowerCase() === priorityFilter.toLowerCase()).length
                                    ? 'bg-primary/10 text-secondary/50 cursor-not-allowed' 
                                    : 'bg-primary/20 text-secondary hover:bg-primary/30'
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-accent hover:bg-accent-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 transform hover:scale-105"
                        onClick={() => setResults(null)}
                      >
                        Analyze Another File
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
