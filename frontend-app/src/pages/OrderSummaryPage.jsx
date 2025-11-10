import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const OrderSummaryPage = () => {
  const bookings = useSelector(state => state.bookings.bookings);
  const [dateRange, setDateRange] = useState({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD')
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookings by date range and search term
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = dayjs(booking.functionDate);
      const startDate = dayjs(dateRange.start);
      const endDate = dayjs(dateRange.end);
      
      // Date range filter
      const inDateRange = bookingDate.isSameOrAfter(startDate, 'day') && 
                         bookingDate.isSameOrBefore(endDate, 'day');
      
      // Search filter
      const matchesSearch = !searchTerm || 
        booking.bookingBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contactNumber.includes(searchTerm) ||
        booking.functionType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return inDateRange && matchesSearch;
    });
  }, [bookings, dateRange, searchTerm]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      acc.totalBookings += 1;
      acc.totalRevenue += booking.totalCost || 0;
      acc.totalGuests += booking.guests || 0;
      acc.totalAdvance += booking.advance || 0;
      return acc;
    }, {
      totalBookings: 0,
      totalRevenue: 0,
      totalGuests: 0,
      totalAdvance: 0
    });
  }, [filteredBookings]);

  // Group bookings by function type
  const bookingsByType = useMemo(() => {
    const grouped = {};
    filteredBookings.forEach(booking => {
      const type = booking.functionType || 'Unknown';
      if (!grouped[type]) {
        grouped[type] = {
          count: 0,
          revenue: 0,
          guests: 0
        };
      }
      grouped[type].count += 1;
      grouped[type].revenue += booking.totalCost || 0;
      grouped[type].guests += booking.guests || 0;
    });
    return grouped;
  }, [filteredBookings]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Summary</h1>
          <p className="text-gray-600">View and analyze your booking data</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, type..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl font-semibold text-gray-900">{summary.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-900">₨{summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-xl font-semibold text-gray-900">{summary.totalGuests.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Advance</p>
                <p className="text-xl font-semibold text-gray-900">₨{summary.totalAdvance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings by Type */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 md:mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bookings by Function Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bookingsByType).map(([type, data]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{type}</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Bookings: <span className="font-medium">{data.count}</span></p>
                  <p className="text-sm text-gray-600">Revenue: <span className="font-medium">₨{data.revenue.toLocaleString()}</span></p>
                  <p className="text-sm text-gray-600">Guests: <span className="font-medium">{data.guests.toLocaleString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bookings List</h2>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your date range or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Function Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.bookingBy}</div>
                        <div className="text-sm text-gray-500">{booking.contactNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {booking.functionType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {dayjs(booking.functionDate).format('MMM D, YYYY')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {booking.guests?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ₨{booking.totalCost?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ₨{booking.advance?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;