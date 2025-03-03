import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Single Analysis', href: '/single-analysis', icon: CameraIcon },
    { name: 'Bulk Analysis', href: '/bulk-analysis', icon: DocumentDuplicateIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-primary/10">
        {/* Logo */}
        <div className="p-4 border-b border-primary/10">
          <div className="flex items-center gap-4 group">
            <img 
              src="/sunsightsLogo.png" 
              alt="Sunsights" 
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-2xl font-bold text-secondary group-hover:text-accent transition-colors duration-300">
              Sunsights
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 group
                  ${active 
                    ? 'bg-primary text-secondary font-medium shadow-lg shadow-primary/20' 
                    : 'text-secondary-dark hover:bg-primary/10 hover:text-secondary'
                  }`}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110 
                  ${active ? 'text-secondary' : 'text-primary-light'}`} 
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-primary/10 bg-surface">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-secondary-dark hover:text-secondary rounded-lg transition-all duration-300 hover:bg-primary/10 group"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-primary-light group-hover:scale-110 transition-transform" />
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
