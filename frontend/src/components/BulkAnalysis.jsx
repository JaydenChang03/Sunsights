import React, { useState, useRef } from 'react'
import { ArrowPathIcon, DocumentTextIcon, ArrowUpTrayIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from '../config/axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function BulkAnalysis() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef(null)

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
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Add a small delay to ensure the file is properly attached to the FormData
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const response = await axios.post(`/api/analytics/analyze-bulk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResults(response.data)
      toast.success('Bulk analysis completed!')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Failed to analyze file')
      
      // Reset the file input if there's an error
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
    } finally {
      setLoading(false)
    }
  }

  // Animation variants for framer-motion
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
                  className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-accent' : 'border-primary'} ${dragActive ? 'bg-accent/10' : 'bg-primary/20'} border-dashed rounded-md hover:border-accent transition-colors duration-300`}
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
                    >
                      <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-accent" />
                    </motion.div>
                    <div className="flex text-sm text-secondary">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent">
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
                    <p className="text-xs text-secondary/70">CSV or Excel files only</p>
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
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeBulk}
                disabled={loading || !file}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-dark bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-all duration-150"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    <span>Processing...</span>
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-accent-dark rounded-b-md"
                      variants={progressVariants}
                      initial="initial"
                      animate="animate"
                    />
                  </>
                ) : (
                  'Analyze File'
                )}
              </motion.button>

              <AnimatePresence>
                {results && (
                  <motion.div 
                    className="mt-6 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="bg-surface rounded-lg p-6 border border-primary/30 shadow-md"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
                    >
                      <motion.div 
                        className="flex items-center mb-4"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <ChartBarIcon className="h-5 w-5 text-accent mr-2" />
                        <h3 className="text-lg font-medium text-secondary">
                          Analysis Results
                        </h3>
                      </motion.div>
                      <div className="space-y-4">
                        <motion.div 
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div 
                            className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20 overflow-hidden relative"
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <motion.div 
                              className="absolute bottom-0 left-0 h-1 bg-accent rounded-b-md"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                            />
                            <p className="text-sm font-medium text-secondary/70">Total Comments</p>
                            <motion.p 
                              className="mt-1 text-2xl font-semibold text-accent"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6, type: "spring" }}
                            >
                              {results.total_comments}
                            </motion.p>
                          </motion.div>
                          <motion.div 
                            className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20 overflow-hidden relative"
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <motion.div 
                              className="absolute bottom-0 left-0 h-1 bg-accent rounded-b-md"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ delay: 0.7, duration: 0.8 }}
                            />
                            <p className="text-sm font-medium text-secondary/70">Average Sentiment</p>
                            <motion.p 
                              className="mt-1 text-2xl font-semibold text-accent"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8, type: "spring" }}
                            >
                              {results.average_sentiment}
                            </motion.p>
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20"
                          variants={itemVariants}
                          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <h4 className="text-sm font-medium text-secondary/70 mb-2">Priority Distribution</h4>
                          <div className="space-y-4">
                            <motion.div 
                              className="relative pt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.9 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-secondary">High Priority</span>
                                <motion.span 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-dark/20 text-accent"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1, type: "spring" }}
                                >
                                  {results.priority_distribution?.high || 0}
                                </motion.span>
                              </div>
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/30">
                                <motion.div 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-dark"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(results.priority_distribution?.high / results.total_comments) * 100}%` }}
                                  transition={{ delay: 1, duration: 1 }}
                                />
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="relative pt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.1 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-secondary">Medium Priority</span>
                                <motion.span 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1.2, type: "spring" }}
                                >
                                  {results.priority_distribution?.medium || 0}
                                </motion.span>
                              </div>
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/30">
                                <motion.div 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(results.priority_distribution?.medium / results.total_comments) * 100}%` }}
                                  transition={{ delay: 1.2, duration: 1 }}
                                />
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="relative pt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.3 }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-secondary">Low Priority</span>
                                <motion.span 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-secondary"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 1.4, type: "spring" }}
                                >
                                  {results.priority_distribution?.low || 0}
                                </motion.span>
                              </div>
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/30">
                                <motion.div 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(results.priority_distribution?.low / results.total_comments) * 100}%` }}
                                  transition={{ delay: 1.4, duration: 1 }}
                                />
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
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
