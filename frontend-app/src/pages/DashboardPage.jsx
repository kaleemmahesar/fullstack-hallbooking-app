import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import EventCalendar from '../components/EventCalendar';

const DashboardPage = () => {
  const bookings = useSelector(state => state.bookings.bookings);

  // Calculate statistics
  const today = dayjs();
  const todayBookings = bookings.filter(booking => 
    dayjs(booking.functionDate).isSame(today, 'day')
  ).length;

  const thisMonthBookings = bookings.filter(booking => 
    dayjs(booking.functionDate).isSame(today, 'month')
  ).length;

  const totalBookings = bookings.length;

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);

  const totalAdvance = bookings.reduce((sum, booking) => sum + (booking.advance || 0), 0);

  const remainingAmount = totalRevenue - totalAdvance;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <Link 
            to="/bookings/new" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-center"
          >
            New Booking
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-1">
              <p className="text-xs font-medium text-gray-600">Today's Bookings</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{todayBookings}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-1">
              <p className="text-xs font-medium text-gray-600">This Month</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{thisMonthBookings}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-1">
              <p className="text-xs font-medium text-gray-600">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalBookings}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-1">
              <p className="text-xs font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₨ {totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-1">
              <p className="text-xs font-medium text-gray-600">Remaining Amount</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₨ {remainingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Event Calendar */}
        <div className="mb-6 md:mb-8">
          <EventCalendar />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;