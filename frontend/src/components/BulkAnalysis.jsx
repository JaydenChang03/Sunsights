import React, { useState } from 'react'
import { ArrowPathIcon, DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from '../config/axios'

// API base URL
const API_URL = 'http://localhost:5000'

export default function BulkAnalysis() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || 
          selectedFile.type === 'application/vnd.ms-excel' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setFile(selectedFile)
      } else {
        toast.error('Please upload a CSV or Excel file')
        e.target.value = null
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="bg-surface rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-primary/20">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-6 w-6 text-accent" />
            <h2 className="ml-2 text-xl font-semibold text-secondary">
              Analyze Multiple Comments
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Upload CSV or Excel file
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primary border-dashed rounded-md hover:border-accent transition-colors duration-300 bg-primary/20">
                <div className="space-y-1 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-accent" />
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
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-secondary/70">CSV or Excel files only</p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-secondary/70">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={analyzeBulk}
              disabled={loading || !file}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-dark bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Analyze File'
              )}
            </button>

            {results && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="bg-primary rounded-lg p-6 border border-primary-dark/20">
                  <h3 className="text-lg font-medium text-secondary mb-4">
                    Analysis Results
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20">
                        <p className="text-sm font-medium text-secondary/70">Total Comments</p>
                        <p className="mt-1 text-2xl font-semibold text-accent">{results.total_comments}</p>
                      </div>
                      <div className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20">
                        <p className="text-sm font-medium text-secondary/70">Average Sentiment</p>
                        <p className="mt-1 text-2xl font-semibold text-accent">{results.average_sentiment}</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary-dark p-4 rounded-lg shadow border border-primary/20">
                      <h4 className="text-sm font-medium text-secondary/70 mb-2">Priority Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary">High Priority</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-dark/20 text-accent">
                            {results.priority_distribution?.high || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary">Medium Priority</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                            {results.priority_distribution?.medium || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary">Low Priority</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-secondary">
                            {results.priority_distribution?.low || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
