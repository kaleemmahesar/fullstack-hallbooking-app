import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBookingInStore } from '../store/slices/bookingsSlice';
import * as api from '../api/mockApi'; // Import the API service
import dayjs from 'dayjs';

const PaymentModal = ({ bookingId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const booking = useSelector(state => state.bookings.bookings.find(b => b.id === bookingId));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If booking is not found, don't render the modal
  if (!booking && isOpen) {
    return null;
  }
  
  // Calculate remaining balance (use the balance from the booking)
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  const remainingBalance = booking.balance !== undefined && booking.balance !== null ? booking.balance : (totalCost - advance);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleAddPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    
    if (amount > 0 && amount <= remainingBalance) {
      setIsSubmitting(true);
      
      try {
        // Create payment data
        const paymentData = {
          amount: amount,
          date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
          method: paymentMethod
        };
        
        // Send payment to the new API endpoint
        const response = await api.addPayment(bookingId, paymentData);
        
        // Update the booking in the Redux store with the response data
        dispatch(updateBookingInStore(response));
        
        alert('Payment added successfully!');
        setPaymentAmount('');
        setPaymentMethod('Cash');
        // Switch to payment history view to show the new payment
        setShowPaymentHistory(true);
      } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to add payment: ' + (error.message || 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert(`Please enter a valid amount between 1 and ${remainingBalance}`);
    }
  };
  
  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setShowPaymentHistory(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Payment Management
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-700">Total Amount</p>
                    <p className="text-lg font-semibold text-indigo-900 mt-1">{formatCurrency(totalCost)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${remainingBalance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-xs ${remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>Balance</p>
                    <p className={`text-lg font-semibold mt-1 ${remainingBalance > 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setShowPaymentHistory(false)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        !showPaymentHistory 
                          ? 'border-indigo-500 text-indigo-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Add Payment
                    </button>
                    <button
                      onClick={() => setShowPaymentHistory(true)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        showPaymentHistory 
                          ? 'border-indigo-500 text-indigo-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Payment History
                    </button>
                  </nav>
                </div>
                
                {!showPaymentHistory ? (
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`Amount (max ${formatCurrency(remainingBalance)})`}
                        min="1"
                        max={remainingBalance}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isSubmitting}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Add Payment
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {advance > 0 || (booking.payments && booking.payments.length > 0) ? (
                      <div className="space-y-3">
                        {/* Show advance payment if it exists */}
                        {advance > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(advance)}</p>
                              <p className="text-xs text-gray-500">Advance Payment</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Advance
                            </span>
                          </div>
                        )}
                        
                        {/* Show additional payments */}
                        {booking.payments && booking.payments.length > 0 && booking.payments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-gray-500">{dayjs(payment.date).format('MMM D, YYYY')}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {payment.method}
                            </span>
                          </div>
                        ))}
                        
                        <div className="flex justify-between pt-3 border-t border-gray-300">
                          <span className="text-sm font-medium text-gray-900">Total Payments:</span>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(advance + (booking.payments ? booking.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0))}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                        <p className="mt-1 text-sm text-gray-500">No payments have been recorded for this booking.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;