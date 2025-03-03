import React, { useState } from 'react';
import axios from '../config/axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate input
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log('Attempting authentication:', {
        endpoint,
        email: formData.email,
        hasPassword: !!formData.password,
        hasName: !!formData.name
      });

      const response = await axios.post(endpoint, {
        email: formData.email.trim(),
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name.trim() })
      });

      console.log('Authentication successful:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
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
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('No response received');
        errorMessage = 'Unable to reach the server. Please check your connection.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#fefae0]">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#606c38]/5 p-8 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 w-full max-w-xl">
          <div className="flex flex-col space-y-8">
            {/* Text Container */}
            <div className="relative h-36">
              {carouselContent.map((content, index) => (
                <div 
                  key={index} 
                  className="carousel-text absolute top-0 left-0 w-full" 
                  data-index={index}
                >
                  <h1 className="text-4xl font-bold text-[#283618] mb-3 hover:text-[#606c38] transition-colors duration-300 cursor-default">
                    {content.title}
                  </h1>
                  <p className="text-lg text-[#283618]/70 hover:text-[#283618] transition-colors duration-300 cursor-default mb-2">
                    {content.description}
                  </p>
                  <p className="text-sm text-[#dda15e] font-medium">
                    {content.highlight}
                  </p>
                </div>
              ))}
            </div>

            {/* Image Container */}
            <div className="w-full relative">
              <div className="carousel-container h-[350px]">
                {carouselContent.map((content, index) => (
                  <img
                    key={index}
                    src={content.image}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-contain carousel-image"
                    data-index={index}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-center space-x-3">
                {carouselContent.map((_, index) => (
                  <div
                    key={index}
                    className="h-2 w-2 rounded-full bg-[#606c38]/60 carousel-dot"
                    data-index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-48 h-48 bg-[#606c38]/5 rounded-full filter blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#dda15e]/5 rounded-full filter blur-xl"></div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center group">
              <div className="flex items-center hover:transform hover:scale-105 transition-all duration-300">
                <img 
                  src="/sunsightsLogo.png" 
                  alt="Sunsights" 
                  className="h-12 w-auto drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" 
                />
                <h2 className="text-3xl font-extrabold ml-3 bg-gradient-to-r from-[#606c38] via-[#dda15e] to-[#bc6c25] bg-clip-text text-transparent drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300" style={{ letterSpacing: '-0.025em' }}>
                  Sunsights
                </h2>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#283618]/70 mb-1 hover:text-[#606c38] transition-colors duration-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="mt-1 block w-full px-4 py-3 bg-white border border-[#606c38]/10 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-[#dda15e] transition-all duration-300"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#283618]/70 mb-1 hover:text-[#606c38] transition-colors duration-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#606c38]/10 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-[#dda15e] transition-all duration-300"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#283618]/70 mb-1 hover:text-[#606c38] transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-white border border-[#606c38]/10 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-[#dda15e] transition-all duration-300"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#283618]/50 hover:text-[#283618] transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#fefae0] bg-[#dda15e] hover:bg-[#bc6c25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dda15e] transition-all duration-300 disabled:opacity-50 hover:shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#fefae0]"></div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            <p className="mt-4 text-center text-sm text-[#283618]/70">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', name: '' });
                }}
                className="font-medium text-[#dda15e] hover:text-[#bc6c25] transition-colors duration-300 hover:underline"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
