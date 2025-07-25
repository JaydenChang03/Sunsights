import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ThemeContext } from '../App';
import TutorialBubble from './TutorialBubble';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // add effect to handle mount animation
  useEffect(() => {
    setMounted(true);
    

    
    return () => setMounted(false);
  }, [darkMode, location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Single Analysis', href: '/single-analysis', icon: CameraIcon },
    { name: 'Bulk Analysis', href: '/bulk-analysis', icon: DocumentDuplicateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path) => location.pathname === path;



  return (
    <div className="flex h-screen bg-bg text-text">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-bg-light/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-200"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-text" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-text" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative w-64 h-full border-r border-border-muted shadow-lg shadow-black/20 overflow-hidden sidebar-bg-animation transition-transform duration-300 ease-in-out z-40`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
        
        {/* Logo */}
        <div className="relative p-6 border-b border-border-muted backdrop-blur-sm">
          <div className="flex items-center gap-4 group">
            <div className="relative overflow-hidden rounded-lg logo-glow">
              <img 
                src="/sunsightsLogo.png" 
                alt="Sunsights" 
                className="h-12 w-auto relative z-10"
              />
            </div>
            <h1 className="text-2xl font-bold relative">
              <span className="relative z-10 group-hover:text-primary transition-colors duration-500">Sunsights</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 ease-out"></span>
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
                onClick={() => setMobileMenuOpen(false)}

                className={`
                  menu-item-hover flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${active 
                    ? 'bg-gradient-to-r from-primary to-secondary font-medium shadow-md active-menu-item text-bg' 
                    : 'hover:bg-primary/10 hover:border-primary/30 hover:shadow-md hover:scale-105 border border-transparent'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary/50
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
                    className={`h-5 w-5 transition-all duration-300 ${active ? 'text-bg' : 'text-text group-hover:text-primary group-hover:scale-110'}`}
                    aria-hidden="true"
                  />
                </div>
                
                {/* Text with improved visibility */}
                <span className={`font-medium menu-text transition-all duration-300 ${active ? 'text-bg' : 'text-text group-hover:text-primary'}`}>
                  {item.name}
                </span>
                
                {/* Active indicator with blinking animation */}
                {active && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-bg active-indicator-dot" aria-hidden="true"></span>
                )}
                
                {/* Hover indicator */}
                {!active && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle and Sign Out */}
        <div className="absolute bottom-0 w-full p-5 border-t border-border-muted backdrop-blur-sm">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-300 mb-2 hover:bg-primary/10 hover:border-primary/30 hover:shadow-md hover:scale-105 border border-transparent group focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 mr-3 transition-all duration-300 group-hover:text-primary group-hover:scale-110" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-5 w-5 mr-3 transition-all duration-300 group-hover:text-primary group-hover:scale-110" aria-hidden="true" />
            )}
            <span className="font-medium transition-all duration-300 group-hover:text-primary">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          
          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-danger/10 hover:border-danger/30 hover:shadow-md hover:scale-105 border border-transparent group focus:outline-none focus:ring-2 focus:ring-danger/30"
            aria-label="Sign out"
          >
            <ArrowLeftOnRectangleIcon 
              className="h-5 w-5 mr-3 transition-all duration-300 group-hover:text-danger group-hover:scale-110" 
              aria-hidden="true"
            />
            <span className="font-medium transition-all duration-300 group-hover:text-danger">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
        {children}
      </div>

      {/* Tutorial Bubble */}
      <TutorialBubble />
    </div>
  );
};

export default Layout;
