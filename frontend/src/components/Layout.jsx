import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import './sidebar.css'; // Import the custom sidebar CSS

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Add effect to handle mount animation
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Single Analysis', href: '/single-analysis', icon: CameraIcon },
    { name: 'Bulk Analysis', href: '/bulk-analysis', icon: DocumentDuplicateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-surface to-surface/90 border-r border-primary/20 shadow-lg shadow-black/20 relative overflow-hidden sidebar-bg-animation">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
        
        {/* Logo */}
        <div className="relative p-6 border-b border-primary/20 backdrop-blur-sm">
          <div className="flex items-center gap-4 group">
            <div className="relative overflow-hidden rounded-lg logo-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary-dark opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
              <img 
                src="/sunsightsLogo.png" 
                alt="Sunsights" 
                className="h-12 w-auto relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            </div>
            <h1 className="text-2xl font-bold text-secondary relative">
              <span className="relative z-10 group-hover:text-accent transition-colors duration-500">Sunsights</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-500 ease-out"></span>
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`relative p-5 space-y-3 ${mounted ? 'stagger-fade-in' : ''}`}>
          {navigation.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  menu-item-hover flex items-center px-4 py-3.5 rounded-xl transition-all duration-300
                  ${active 
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-secondary font-medium shadow-md active-menu-item' 
                    : 'text-secondary-dark hover:text-secondary'
                  }
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 focus:ring-offset-surface
                `}
                style={{
                  transform: active ? 'translateX(5px)' : 'translateX(0)',
                  transitionDelay: `${index * 50}ms`
                }}
                aria-current={active ? 'page' : undefined}
              >
                {/* Icon with improved hover effect */}
                <div className="relative mr-3 icon-container">
                  <item.icon 
                    className={`h-5 w-5 transition-all duration-300
                      ${active 
                        ? 'text-secondary' 
                        : 'text-primary-light'
                      }`} 
                    aria-hidden="true"
                  />
                </div>
                
                {/* Text with improved visibility */}
                <span className="font-medium menu-text">{item.name}</span>
                
                {/* Active indicator with blinking animation */}
                {active && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full active-indicator-dot" aria-hidden="true"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button with improved hover effect */}
        <div className="absolute bottom-0 w-full p-5 border-t border-primary/20 bg-surface/80 backdrop-blur-sm">
          <button
            onClick={onLogout}
            className="logout-btn-hover flex items-center w-full px-4 py-3.5 text-secondary-dark hover:text-secondary rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Sign out"
          >
            <ArrowLeftOnRectangleIcon 
              className="h-5 w-5 mr-3 text-primary-light" 
              aria-hidden="true"
            />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
