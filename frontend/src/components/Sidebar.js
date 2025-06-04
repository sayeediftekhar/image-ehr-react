import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/patients', icon: 'fas fa-users', label: 'Patients' },
    { path: '/visits', icon: 'fas fa-calendar-check', label: 'Visits' },
    { path: '/billing', icon: 'fas fa-file-invoice-dollar', label: 'Billing' },
    { path: '/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-purple-700 text-white shadow-lg z-50">
      {/* Header */}
      <div className="p-6 border-b border-white border-opacity-20">
        <div className="flex items-center justify-center gap-3">
          <img 
            src="/images/logo.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h2 className="text-xl font-semibold">IMAGE EHR</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-8 mb-4">
          <h3 className="text-xs uppercase tracking-wider text-white text-opacity-70 font-medium">
            ADMIN
          </h3>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-white text-opacity-90 hover:bg-white hover:bg-opacity-10 transition-all duration-200 border-l-3 ${
                location.pathname === item.path
                  ? 'bg-white bg-opacity-15 border-white'
                  : 'border-transparent'
              }`}
            >
              <i className={`${item.icon} w-5 mr-3`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;