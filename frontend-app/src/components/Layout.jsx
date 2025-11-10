import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api/mockApi';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Bookings', path: '/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Expenses', path: '/expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Vendors', path: '/vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' } // Add Vendors navigation item
  ];

  const handleLogout = async () => {
    try {
      // Call the logout API
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and redirect to login
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile header with menu button */}
      <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-indigo-700 to-indigo-800 p-4 text-white shadow-md sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded-lg">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">Wedding Hall</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-indigo-700 to-indigo-800 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full pt-5">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-white text-xl font-bold">Wedding Hall</h1>
            </div>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-50'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out`}
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-600 p-4">
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center text-indigo-200 hover:bg-indigo-600 hover:bg-opacity-50 px-4 py-3 text-sm font-medium rounded-lg w-full transition-all duration-200 ease-in-out"
            >
              <svg className="mr-3 h-5 w-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-indigo-700 to-indigo-800 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-white text-xl font-bold">Wedding Hall</h1>
            </div>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-50'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]`}
                >
                  <svg className="mr-3 h-5 w-5 text-indigo-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-600 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-indigo-200 hover:bg-indigo-600 hover:bg-opacity-50 px-4 py-3 text-sm font-medium rounded-lg w-full transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
            >
              <svg className="mr-3 h-5 w-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0 md:pl-64">
        <main className="flex-1 py-4 md:py-6">
          <div className="px-4 md:px-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 md:py-6">
          <div className="px-4 md:px-6">
            <p className="text-center text-sm text-gray-500">
              © 2025 Business Solution by WebKit Solutions
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;