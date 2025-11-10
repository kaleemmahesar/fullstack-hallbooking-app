import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateBooking } from '../store/slices/bookingsSlice';
import dayjs from 'dayjs';
import PaymentModal from './PaymentModal';
import ExpenseModal from './ExpenseModal';
import { shareBookingConfirmation } from '../utils/sharingUtils'; // Added import for sharing utilities
import { canEdit } from '../utils/authUtils'; // Import auth utilities

const BookingCard = ({ bookingId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const booking = useSelector(state => state.bookings.bookings.find(b => b.id === bookingId));
  const expenses = useSelector(state => state.expenses.expenses);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // If booking is not found, don't render the card
  if (!booking) {
    return null;
  }
  
  // Calculate remaining balance (use the balance from API response)
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  // Use the balance from the API response if it exists and is not null, otherwise calculate it
  const remainingBalance = (booking.balance !== undefined && booking.balance !== null) ? booking.balance : (totalCost - advance);
  
  // Calculate total payments (advance + additional payments)
  const totalPayments = advance + (booking.payments ? booking.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0);
  
  // Calculate total expenses for this booking
  const bookingExpenses = expenses.filter(expense => {
    // Ensure both bookingId values are of the same type for comparison
    // Also check if bookingId might be stored as integer in database but as string in frontend
    const match = String(expense.bookingId) === String(booking.id) || 
                  parseInt(expense.bookingId) === parseInt(booking.id);
    return match;
  });
  const totalExpenses = bookingExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  
  // Debug logging
  // console.log('Booking ID:', booking.id);
  // console.log('All expenses:', expenses);
  // console.log('Filtered expenses:', bookingExpenses);
  // console.log('Total expenses:', totalExpenses);
  
  // Check if booking is for today
  const isToday = dayjs(booking.functionDate).isSame(dayjs(), 'day');
  
  // Check if booking is completed (past date)
  const isCompleted = dayjs(booking.functionDate).isBefore(dayjs(), 'day');
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle edit button click
  const handleEditClick = () => {
    navigate(`/bookings/edit/${booking.id}`);
  };

  // Handle sharing via WhatsApp
  const handleShareViaWhatsApp = async () => {
    await shareBookingConfirmation(booking);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-300">
        {/* Header with edit button and customer info */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{booking.bookingBy}</h3>
              <div className="flex items-center mt-1">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-sm text-gray-500">{booking.contactNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </span>
            ) : isToday ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Upcoming
              </span>
            )}
            {canEdit() && (
              <button 
                onClick={handleEditClick}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit Booking"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Function details in a horizontal row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium text-gray-700">{booking.functionType}</span>
          </div>
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs text-gray-600">{booking.guests} guests</span>
          </div>
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-600">{dayjs(booking.functionDate).format('MMM D, YYYY')}</span>
          </div>
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-600">{booking.startTime} - {booking.endTime}</span>
          </div>
        </div>
        
        {/* Financial information in a compact horizontal layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-indigo-50 p-2 rounded">
            <p className="text-xs text-indigo-700">Total</p>
            <p className="text-sm font-semibold text-indigo-900">{formatCurrency(totalCost)}</p>
          </div>
          <div className={`p-2 rounded ${remainingBalance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className={`text-xs ${remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>Balance</p>
            <p className={`text-sm font-semibold ${remainingBalance > 0 ? 'text-red-900' : 'text-green-900'}`}>
              {formatCurrency(remainingBalance)}
            </p>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-blue-700">Total Payments</p>
            <p className="text-sm font-semibold text-blue-900">{formatCurrency(totalPayments)}</p>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <p className="text-xs text-purple-700">Profit</p>
            <p className="text-sm font-semibold text-purple-900">{formatCurrency(totalCost - totalExpenses)}</p>
          </div>
        </div>
        
        {/* Additional charges in a horizontal layout */}
        {(booking.djCharges > 0 || booking.decorCharges > 0 || booking.tmaCharges > 0 || booking.otherCharges > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {booking.djCharges > 0 && (
              <div className="bg-yellow-50 p-2 rounded">
                <p className="text-xs text-yellow-700">DJ</p>
                <p className="text-sm font-semibold text-yellow-900">{formatCurrency(booking.djCharges)}</p>
              </div>
            )}
            {booking.decorCharges > 0 && (
              <div className="bg-pink-50 p-2 rounded">
                <p className="text-xs text-pink-700">Decor</p>
                <p className="text-sm font-semibold text-pink-900">{formatCurrency(booking.decorCharges)}</p>
              </div>
            )}
            {booking.tmaCharges > 0 && (
              <div className="bg-teal-50 p-2 rounded">
                <p className="text-xs text-teal-700">TMA</p>
                <p className="text-sm font-semibold text-teal-900">{formatCurrency(booking.tmaCharges)}</p>
              </div>
            )}
            {booking.otherCharges > 0 && (
              <div className="bg-orange-50 p-2 rounded">
                <p className="text-xs text-orange-700">Other</p>
                <p className="text-sm font-semibold text-orange-900">{formatCurrency(booking.otherCharges)}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons in a compact row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 min-w-[80px] px-2 py-1.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expenses
          </button>
          {remainingBalance > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 min-w-[80px] px-2 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment
            </button>
          )}
          
          {/* Print Receipt Button */}
          <button
            onClick={() => {
              // Create a temporary receipt component for printing
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Booking Receipt</title>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    @media print {
                      body {
                        margin: 0;
                        padding: 2mm;
                        width: 78mm;
                        font-size: 4pt;
                      }
                      .print-small { font-size: 4pt; }
                      .print-medium { font-size: 5pt; }
                      .print-large { font-size: 6pt; }
                    }
                  </style>
                </head>
                <body>
                  <div class="bg-white p-2 max-w-[78mm] mx-auto">
                    <div class="text-center mb-3">
                      <h1 class="text-lg font-bold text-gray-900 mb-1 print-medium">Wedding Hall Booking Receipt</h1>
                      <p class="text-gray-600 text-xs print-small">Booking Confirmation Details</p>
                      <div class="border-b border-gray-300 my-2"></div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-2 mb-3">
                      <div class="border border-gray-200 rounded p-2">
                        <h2 class="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Booking Details</h2>
                        <div class="space-y-1">
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">ID:</span>
                            <span class="font-medium">#${booking.id.substring(0, 8)}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Date:</span>
                            <span class="font-medium">${new Date(booking.bookingDate || new Date()).toLocaleDateString()}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">By:</span>
                            <span class="font-medium">${booking.bookingBy}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">CNIC:</span>
                            <span class="font-medium">${booking.cnic}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Contact:</span>
                            <span class="font-medium">${booking.contactNumber}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="border border-gray-200 rounded p-2">
                        <h2 class="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Function Details</h2>
                        <div class="space-y-1">
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Type:</span>
                            <span class="font-medium">${booking.functionType}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Date:</span>
                            <span class="font-medium">${new Date(booking.functionDate).toLocaleDateString()}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Time:</span>
                            <span class="font-medium">${booking.startTime} - ${booking.endTime}</span>
                          </div>
                          <div class="flex justify-between text-xs print-small">
                            <span class="text-gray-600">Guests:</span>
                            <span class="font-medium">${booking.guests}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="mb-3 border border-gray-200 rounded p-2">
                      <h2 class="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Menu Items</h2>
                      ${booking.menuItems && booking.menuItems.length > 0 ? 
                        `<div class="grid grid-cols-2 gap-1">
                          ${booking.menuItems.map((item, index) => 
                            `<div class="bg-gray-50 rounded p-1 border border-gray-200">
                              <span class="text-xs font-medium text-gray-800 print-small">${item}</span>
                            </div>`
                          ).join('')}
                        </div>` : 
                        `<p class="text-gray-500 italic text-xs print-small">No menu items</p>`
                      }
                    </div>
                    
                    <div class="border border-gray-200 rounded p-2 mb-3">
                      <h2 class="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Payment Details</h2>
                      <div class="space-y-1">
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">Per Head:</span>
                          <span class="font-medium">₨${booking.costPerHead?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">Total:</span>
                          <span class="font-bold text-gray-900">₨${(booking.totalCost || 0).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">Advance:</span>
                          <span class="font-medium text-green-600">₨${(booking.advance || 0).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between pt-1 border-t border-gray-200 text-xs print-small">
                          <span class="text-gray-600 font-medium">Balance:</span>
                          <span class="font-bold text-gray-900">₨${(booking.balance || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Additional Charges Section -->
                    ${(booking.djCharges > 0 || booking.decorCharges > 0 || booking.tmaCharges > 0 || booking.otherCharges > 0) ? `
                    <div class="border border-gray-200 rounded p-2 mb-3">
                      <h2 class="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Additional Charges</h2>
                      <div class="space-y-1">
                        ${booking.djCharges > 0 ? `
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">DJ Charges:</span>
                          <span class="font-medium">₨${booking.djCharges.toLocaleString()}</span>
                        </div>` : ''}
                        ${booking.decorCharges > 0 ? `
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">Decor Charges:</span>
                          <span class="font-medium">₨${booking.decorCharges.toLocaleString()}</span>
                        </div>` : ''}
                        ${booking.tmaCharges > 0 ? `
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">TMA Charges:</span>
                          <span class="font-medium">₨${booking.tmaCharges.toLocaleString()}</span>
                        </div>` : ''}
                        ${booking.otherCharges > 0 ? `
                        <div class="flex justify-between text-xs print-small">
                          <span class="text-gray-600">Other Charges:</span>
                          <span class="font-medium">₨${booking.otherCharges.toLocaleString()}</span>
                        </div>` : ''}
                      </div>
                    </div>` : ''}
                    
                    <div class="text-center text-gray-600 text-xs print-small mb-2">
                      <p>Thank you for choosing our services!</p>
                      <p class="mt-1">${booking.contactNumber}</p>
                    </div>
                  </div>
                  
                  <script>
                    window.onload = function() {
                      window.print();
                      setTimeout(function() { window.close(); }, 1000);
                    }
                  </script>
                </body>
                </html>
              `);
              printWindow.document.close();
            }}
            className="flex-1 min-w-[80px] px-2 py-1.5 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors flex items-center justify-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Print
          </button>
          {/* Added WhatsApp Share Button */}
          <button
            onClick={handleShareViaWhatsApp}
            className="flex-1 min-w-[80px] px-2 py-1.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Share
          </button>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal 
        bookingId={booking.id} 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
      
      {/* Expense Modal */}
      <ExpenseModal 
        bookingId={booking.id} 
        bookingBy={booking.bookingBy}
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
      />
    </>
  );
};

export default BookingCard;