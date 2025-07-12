import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import axios from './config/axios'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import SingleAnalysis from './components/SingleAnalysis'
import BulkAnalysis from './components/BulkAnalysis'
import Analytics from './components/Analytics'
import Profile from './components/Profile'
import Auth from './components/Auth'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/api/auth/user')
      setUser(response.data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Auth route - if user is logged in, redirect to dashboard */}
        <Route path="/auth" element={
          user ? <Navigate to="/dashboard" replace /> : <Auth onAuthSuccess={handleAuthSuccess} />
        } />
        
        {/* Root route - always redirect to auth if not logged in */}
        <Route path="/" element={
          <Navigate to="/auth" replace />
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/single-analysis" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <SingleAnalysis />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/bulk-analysis" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <BulkAnalysis />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout}>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Redirect all other routes to /auth */}
        <Route path="*" element={
          <Navigate to="/auth" replace />
        } />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
