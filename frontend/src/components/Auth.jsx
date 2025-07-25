import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';



const carouselContent = [
  {
    title: "Emotion Analysis Platform",
    description: "Unleash the Power of AI to Understand Emotions in Text and Speech",
    image: "/imageA.png",
    highlight: "Real-time sentiment analysis with advanced AI technology"
  },
  {
    title: "Data-Driven Insights",
    description: "Transform Your Understanding of Customer Emotions",
    image: "/imageB.png",
    highlight: "Comprehensive analytics and visualization tools"
  },
  {
    title: "Bulk Analysis Made Easy",
    description: "Process Thousands of Comments in Minutes",
    image: "/imageC.png",
    highlight: "Efficient batch processing for large-scale analysis"
  }
];

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // component initialization
  }, []);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // validate input
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      const response = await axios.post(endpoint, {
        email: formData.email.trim(),
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name.trim() })
      });

      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success(`Successfully ${isLogin ? 'logged in' : 'registered'}!`);
        onAuthSuccess(user);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = 'An error occurred during authentication';
      
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-background min-h-screen bg-gradient-to-br from-bg-light to-bg flex items-center justify-center p-4">
      {/* Single Card Container - matches reference image */}
      <div className="main-card-container w-full max-w-6xl bg-bg-light rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Side - Illustration Section */}
          <div className="lg:w-3/5 bg-bg-light p-8 lg:p-12 flex flex-col justify-start items-start relative">
            {/* Logo and Title - Top Left Aligned */}
            <div className="mb-8 w-full">
              <div className="logo-container flex items-center mb-6">
                <img 
                  src="/sunsightsLogo.png" 
                  alt="Sunsights" 
                  className="h-16 w-auto mr-4" 
                />
                <h1 
                  className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  style={{ fontSize: '2rem' }}
                >
                  Sunsights
                </h1>
              </div>
              
              {/* Carousel Text Content - Left Aligned */}
              <div className="relative h-32 mb-8">
                {carouselContent.map((content, index) => (
                  <div 
                    key={index} 
                    className="carousel-text absolute top-0 left-0 w-full" 
                    data-index={index}
                  >
                    <h2 className="text-base font-bold text-text mb-2 text-left">
                      {content.title.includes('Performance') ? (
                        <>
                          Unlock Your Team <span className="text-primary">Performance</span>
                        </>
                      ) : (
                        content.title
                      )}
                    </h2>
                    <p className="description-text text-lg text-text-muted max-w-md text-left">
                      {content.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Images - Centered */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full max-w-lg">
                <div className="carousel-container h-80 relative">
                  {carouselContent.map((content, index) => (
                    <img
                      key={index}
                      src={content.image}
                      alt={`${content.title} Illustration`}
                      className="carousel-image w-full h-full object-contain hover:scale-110 hover:drop-shadow-lg transition-all duration-300 cursor-pointer"
                      data-index={index}
                    />
                  ))}
                </div>
                
                {/* Carousel Dots */}
                <div className="mt-6 flex justify-center space-x-3">
                  {carouselContent.map((_, index) => (
                    <div
                      key={index}
                      className="carousel-dot h-3 w-3 rounded-full bg-primary/60 hover:bg-primary hover:scale-125 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      data-index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-bg-light">
            <div className="w-full max-w-md mx-auto">
              
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-base font-bold text-text mb-2">
                  {isLogin ? 'Welcome to Sunsights' : 'Create Account'}
                </h3>
                <p className="text-text-muted">
                  {isLogin ? 'Unlock Your Team Performance' : 'Join us and start analyzing emotions'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field - Only for Registration */}
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      className="w-full px-4 py-3 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                      value={formData.name}
                      onChange={handleChange}

                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                    value={formData.email}
                    onChange={handleChange}

                    placeholder="Enter your email address"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 pr-12 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                      value={formData.password}
                      onChange={handleChange}

                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary hover:scale-110 transition-all duration-200"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bg mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Login' : 'Register'
                  )}
                </button>

                {/* Form Toggle */}
                <div className="text-center">
                  <p className="text-sm text-text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setFormData({ email: '', password: '', name: '' });
                      }}
                      className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
                    >
                      {isLogin ? 'Register' : 'Login'}
                    </button>
                  </p>
                </div>
              </form>

              {/* Copyright */}
              <div className="mt-8 text-center">
                <p className="text-xs text-text-muted hover:text-text transition-colors duration-200">
                  © 2025 all rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
