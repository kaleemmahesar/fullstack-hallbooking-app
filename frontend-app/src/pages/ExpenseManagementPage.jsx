import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpenseManagement from '../components/ExpenseManagement';
import { fetchExpenses } from '../store/slices/expensesSlice'; // Add import for fetchExpenses

const ExpenseManagementPage = () => {
  const dispatch = useDispatch(); // Add dispatch
  const bookings = useSelector(state => state.bookings.bookings);
  const expenses = useSelector(state => state.expenses.expenses);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Add useEffect to fetch expenses when component mounts
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleBookingChange = (e) => {
    setSelectedBookingId(e.target.value);
    setShowAddExpense(false);
  };

  const selectedBooking = bookings.find(booking => booking.id === selectedBookingId);
  
  // Overall expenses calculations
  const totalOverallExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  }, [expenses]);

  const overallExpensesByCategory = useMemo(() => {
    const categoryMap = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          amount: 0,
          count: 0,
          percentage: 0
        };
      }
      categoryMap[category].amount += parseFloat(expense.amount) || 0;
      categoryMap[category].count += 1;
    });
    
    // Convert to array and calculate percentages
    const categoryArray = Object.values(categoryMap);
    if (totalOverallExpenses > 0) {
      categoryArray.forEach(category => {
        category.percentage = Math.round((category.amount / totalOverallExpenses) * 100);
      });
    }
    
    // Sort by amount (descending)
    return categoryArray.sort((a, b) => b.amount - a.amount);
  }, [expenses, totalOverallExpenses]);

  const totalBookingsWithExpenses = useMemo(() => {
    const bookingIds = [...new Set(expenses.map(expense => expense.bookingId))];
    return bookingIds.length;
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Expense Management</h1>
        </div>

        {/* Overall Expense Statistics */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Expense Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Overall Expenses Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">Total Expenses</h3>
                  <p className="text-lg font-semibold text-gray-900">₨{totalOverallExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Total Bookings with Expenses Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">Bookings with Expenses</h3>
                  <p className="text-lg font-semibold text-gray-900">{totalBookingsWithExpenses}</p>
                </div>
              </div>
            </div>

            {/* Total Number of Expenses Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">Total Expenses Count</h3>
                  <p className="text-lg font-semibold text-gray-900">{expenses.length}</p>
                </div>
              </div>
            </div>

            {/* Average Expense Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-gray-500">Average Expense</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    ₨{expenses.length > 0 ? Math.round(totalOverallExpenses / expenses.length).toLocaleString() : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Category Breakdown */}
          {overallExpensesByCategory.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">Overall Expense Breakdown by Category</h3>
              <div className="flex flex-wrap gap-2">
                {overallExpensesByCategory.map((category, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-900 text-sm">{category.name}: </span>
                    <span className="text-gray-700 text-sm">₨ {category.amount.toLocaleString()} ({category.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Booking <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBookingId}
                onChange={handleBookingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select a booking</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.bookingBy} - {new Date(booking.functionDate).toLocaleDateString()} - {booking.functionType}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedBooking && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Selected Booking</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{selectedBooking.bookingBy}</span> - 
                  {new Date(selectedBooking.functionDate).toLocaleDateString()} - 
                  {selectedBooking.functionType} - 
                  {selectedBooking.guests} guests
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedBookingId && (
          <ExpenseManagement 
            bookingId={selectedBookingId} 
            isAddingExpense={showAddExpense}
            onToggleAddExpense={setShowAddExpense}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseManagementPage;