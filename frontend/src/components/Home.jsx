import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CameraIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#606C38] to-[#283618] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-6">Welcome to Sunsights</h1>
          <p className="text-xl mb-12 text-gray-200">
            Discover the power of emotion detection through advanced AI technology
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {/* Feature 1 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#606C38]/20 backdrop-blur-lg p-8 rounded-lg border border-[#606C38]/30"
          >
            <div className="bg-[#606C38] p-3 rounded-full w-fit mb-6">
              <CameraIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Real-time Analysis</h3>
            <p className="text-gray-300">
              Get instant emotion detection results from your camera feed
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#606C38]/20 backdrop-blur-lg p-8 rounded-lg border border-[#606C38]/30"
          >
            <div className="bg-[#606C38] p-3 rounded-full w-fit mb-6">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Detailed Analytics</h3>
            <p className="text-gray-300">
              Track and analyze emotional patterns over time
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-[#606C38]/20 backdrop-blur-lg p-8 rounded-lg border border-[#606C38]/30"
          >
            <div className="bg-[#606C38] p-3 rounded-full w-fit mb-6">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">User Profiles</h3>
            <p className="text-gray-300">
              Personalized experience with custom user profiles
            </p>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            to="/dashboard"
            className="bg-[#606C38] hover:bg-[#606C38]/90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center space-x-2"
          >
            Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
