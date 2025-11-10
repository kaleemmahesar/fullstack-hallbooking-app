import React from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import { generateBookingSlipPDF } from '../utils/pdfGenerator';

const BookingSlip = ({ bookingId }) => {
  const booking = useSelector(state => 
    state.bookings.bookings.find(b => b.id === bookingId)
  );
  
  const expenses = useSelector(state => 
    state.expenses.expenses.filter(e => e.bookingId === bookingId)
  );

  if (!booking) {
    return <div>Booking not found</div>;
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = booking.totalCost - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateBookingSlipPDF(booking, expenses);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 print:p-0 print:shadow-none print:rounded-none print:m-0">
      {/* Print Header */}
      <div className="print:border-b print:border-gray-200 print:pb-4 mb-6 hidden print:block">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 print:text-black print:text-3xl">Wedding Hall Booking Slip</h1>
          <p className="text-gray-600 print:text-black print:text-lg">Official Receipt</p>
        </div>
      </div>

      {/* Slip Header - Visible only on screen */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Booking Slip</h2>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handlePrint}>
            Print Slip
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            Download as PDF
          </Button>
        </div>
      </div>

      {/* Booking Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-lg p-4 print:border-0 print:p-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Booking Information</h3>
          <div className="space-y-2">
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Booking ID:</span>
              <span>#{booking.id}</span>
            </div>
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Booking Date:</span>
              <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Function Date:</span>
              <span>{new Date(booking.functionDate).toLocaleDateString()}</span>
            </div>
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Function Type:</span>
              <span>{booking.functionType}</span>
            </div>
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Hall Reserved:</span>
              <span>{booking.hallReserved}</span>
            </div>
            <div className="flex print:block">
              <span className="w-40 font-medium text-gray-600 print:w-auto print:block print:mb-1">Time:</span>
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 print:border-0 print:p-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Customer Information</h3>
          <div className="space-y-2">
            <div className="flex print:block">
              <span className="w-32 font-medium text-gray-600 print:w-auto print:block print:mb-1">Name:</span>
              <span>{booking.bookingBy}</span>
            </div>
            <div className="flex print:block">
              <span className="w-32 font-medium text-gray-600 print:w-auto print:block print:mb-1">CNIC:</span>
              <span>{booking.cnic}</span>
            </div>
            <div className="flex print:block">
              <span className="w-32 font-medium text-gray-600 print:w-auto print:block print:mb-1">Contact:</span>
              <span>{booking.contactNumber}</span>
            </div>
            <div className="flex print:block">
              <span className="w-32 font-medium text-gray-600 print:w-auto print:block print:mb-1">Address:</span>
              <span>{booking.address}</span>
            </div>
            <div className="flex print:block">
              <span className="w-32 font-medium text-gray-600 print:w-auto print:block print:mb-1">Guests:</span>
              <span>{booking.guests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Menu Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 print:divide-gray-400 print:text-black">
            <thead className="bg-gray-50 print:bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm">
                  Cost (₨)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-400">
              {booking.menuItems.map((item, index) => (
                <tr key={index} className="print:border-b print:border-gray-400">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 print:text-black">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:text-black">
                    ₨{item.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div></div> {/* Empty div for spacing */}
        <div className="border border-gray-200 rounded-lg p-4 print:border-0 print:p-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between print:block">
              <span className="font-medium text-gray-600 print:text-black print:block print:mb-1">Total Cost:</span>
              <span>₨{booking.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between print:block">
              <span className="font-medium text-gray-600 print:text-black print:block print:mb-1">Advance Paid:</span>
              <span>₨{booking.advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 print:border-t print:border-gray-400 print:pt-2 print:block">
              <span className="font-medium text-gray-600 print:text-black print:block print:mb-1">Balance:</span>
              <span className="font-medium">₨{(booking.totalCost - booking.advance).toLocaleString()}</span>
            </div>
            <div className="flex justify-between print:block">
              <span className="font-medium text-gray-600 print:text-black print:block print:mb-1">Total Expenses:</span>
              <span>₨{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 print:border-t print:border-gray-400 print:pt-2 print:block">
              <span className="font-medium text-gray-600 print:text-black print:block print:mb-1">Net Profit:</span>
              <span className="font-medium text-green-600 print:text-black">₨{netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charges - Only show if there are charges */}
      {(booking.djCharges > 0 || booking.decorCharges > 0 || booking.tmaCharges > 0 || booking.otherCharges > 0) && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 print:border-0 print:p-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Additional Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.djCharges > 0 && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">DJ Charges:</span>
                <span>₨{booking.djCharges.toLocaleString()}</span>
              </div>
            )}
            {booking.decorCharges > 0 && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Decor Charges:</span>
                <span>₨{booking.decorCharges.toLocaleString()}</span>
              </div>
            )}
            {booking.tmaCharges > 0 && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">TMA Charges:</span>
                <span>₨{booking.tmaCharges.toLocaleString()}</span>
              </div>
            )}
            {booking.otherCharges > 0 && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Other Charges:</span>
                <span>₨{booking.otherCharges.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Notes - Only show if there are notes */}
      {booking.specialNotes && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 print:border-0 print:p-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4 print:text-xl">Special Notes</h3>
          <p className="text-gray-700">{booking.specialNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center print:mt-4 print:pt-4 print:border-t print:border-gray-400">
        <p className="text-gray-500 text-sm print:text-black print:text-sm">
          Thank you for choosing our wedding hall services!
        </p>
        <p className="text-gray-500 text-sm mt-1 print:text-black print:text-sm">
          For any queries, please contact us at 0300-1234567
        </p>
      </div>
    </div>
  );
};

export default BookingSlip;