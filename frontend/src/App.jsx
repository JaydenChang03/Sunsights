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

// Create a theme context
export const ThemeContext = React.createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

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
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference stored
    const savedPreference = localStorage.getItem('darkMode');
    return savedPreference ? JSON.parse(savedPreference) : false;
  })

  useEffect(() => {
    // ALWAYS force authentication on app startup
    console.log('🔐='.repeat(20));
    console.log('🔐 APP STARTUP: FORCING FRESH AUTHENTICATION');
    console.log('🔐 User will ALWAYS be redirected to auth page');
    console.log('🔐='.repeat(20));
    forceLogout();
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    
    console.log('🔐 AUTH CHECK DEBUG:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      timestamp: new Date().toISOString(),
      currentUser: user ? user.email : null
    });
    
    if (!token) {
      console.log('🔐 No token found - showing auth page');
      setLoading(false)
      return
    }

    console.log('🔐 Token found - validating with backend...');
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/api/auth/user')
      console.log('🔐 Token validation SUCCESS - auto-logging in user:', response.data.user.email);
      setUser(response.data.user)
    } catch (error) {
      console.error('🔐 Token validation FAILED:', error.response?.status, error.response?.data);
      console.log('🔐 Clearing invalid token and showing auth page');
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
    console.log('🔐 Manual logout triggered');
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const forceLogout = () => {
    console.log('🔐 Force logout on app startup - clearing all authentication data');
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <Routes>
          {/* Auth route - always show auth on startup since we force logout */}
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
    </ThemeContext.Provider>
  )
}

export default App

