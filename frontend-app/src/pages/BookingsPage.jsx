import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import BookingCard from '../components/BookingCard';
import dayjs from 'dayjs';
import { fetchBookings } from '../store/slices/bookingsSlice';
import { fetchExpenses } from '../store/slices/expensesSlice';

const BookingsPage = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(state => state.bookings.bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('functionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load bookings and expenses when component mounts
  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchExpenses());
  }, [dispatch]);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.bookingBy.toLowerCase().includes(term) ||
        booking.contactNumber.includes(term) ||
        booking.functionType.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => 
        dayjs(booking.functionDate).isSame(dayjs(dateFilter), 'day')
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const today = dayjs();
      filtered = filtered.filter(booking => {
        const isToday = dayjs(booking.functionDate).isSame(today, 'day');
        const isCompleted = dayjs(booking.functionDate).isBefore(today, 'day');
        
        if (statusFilter === 'today') return isToday;
        if (statusFilter === 'completed') return isCompleted;
        if (statusFilter === 'upcoming') return !isToday && !isCompleted;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'functionDate') {
        aValue = new Date(a.functionDate);
        bValue = new Date(b.functionDate);
      } else if (sortBy === 'bookingBy') {
        aValue = a.bookingBy.toLowerCase();
        bValue = b.bookingBy.toLowerCase();
      } else if (sortBy === 'totalCost') {
        aValue = a.totalCost || 0;
        bValue = b.totalCost || 0;
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, searchTerm, dateFilter, statusFilter, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="mt-1 text-gray-600">Manage all your event bookings in one place</p>
          </div>
          <Link 
            to="/bookings/new" 
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Booking
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 md:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bookings..."
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="functionDate">Event Date</option>
                <option value="bookingBy">Customer Name</option>
                <option value="totalCost">Total Cost</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredBookings.length}</span> of <span className="font-medium">{bookings.length}</span> bookings
            </p>
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
            <div className="mt-6">
              <Link 
                to="/bookings/new" 
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                Create your first booking
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
            {filteredBookings.map(booking => (
              <BookingCard key={booking.id} bookingId={booking.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;