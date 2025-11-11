import React from 'react';
import Button from './Button';
import { shareBookingConfirmation } from '../utils/sharingUtils'; // Added import for sharing utilities

// Utility function to format time (HH:MM:SS or HH:MM) to HH:MM only
const formatTime = (timeString) => {
  if (!timeString) return '';
  // Split the time string by ':' and take only the first two parts (hours and minutes)
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
};

const BookingReceipt = ({ booking, onClose }) => {
  // Calculate total cost
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  const balance = totalCost - advance;

  // Handle print functionality to match BookingCard.jsx implementation
  const handlePrint = () => {
    // Create a temporary receipt component for printing that matches BookingCard.jsx
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
                  <span class="font-medium">#{booking.id ? String(booking.id).substring(0, 8) : 'N/A'}</span>
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
                  <span class="font-medium">${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</span>
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
                <span class="font-bold text-gray-900">₨${totalCost.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-xs print-small">
                <span class="text-gray-600">Advance:</span>
                <span class="font-medium text-green-600">₨${advance.toLocaleString()}</span>
              </div>
              <div class="flex justify-between pt-1 border-t border-gray-200 text-xs print-small">
                <span class="text-gray-600 font-medium">Balance:</span>
                <span class="font-bold text-gray-900">₨${balance.toLocaleString()}</span>
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
  };

  // Handle sharing via WhatsApp
  const handleShareViaWhatsApp = () => {
    shareBookingConfirmation(booking);
  };

  return (
    <div className="bg-white p-2 max-w-3xl mx-auto print:p-1 print:max-w-[78mm] print:mx-auto">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 78mm;
            margin: 0;
            padding: 2mm;
            font-size: 4pt;
          }
          .no-print {
            display: none !important;
          }
          .print-small { font-size: 4pt; }
          .print-medium { font-size: 5pt; }
          .print-large { font-size: 6pt; }
        }
      `}</style>

      <div className="print-container">
        {/* Header */}
        <div className="text-center mb-4 print:mb-2">
          <h1 className="text-xl font-bold text-gray-900 mb-2 print:text-lg print-small">Wedding Hall Booking Receipt</h1>
          <p className="text-gray-600 text-sm print:text-xs print-small">Booking Confirmation Details</p>
          <div className="border-b border-gray-300 my-3 print:my-2"></div>
        </div>

        {/* Booking Information */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="border border-gray-200 rounded p-2 print:p-1">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Booking Details</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">ID:</span>
                <span className="font-medium">#{booking.id ? String(booking.id).substring(0, 8) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(booking.bookingDate || new Date()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">By:</span>
                <span className="font-medium">{booking.bookingBy}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">CNIC:</span>
                <span className="font-medium">{booking.cnic}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{booking.contactNumber}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-2 print:p-1">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Function Details</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{booking.functionType}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(booking.functionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              </div>
              <div className="flex justify-between text-xs print-small">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">{booking.guests}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-3 border border-gray-200 rounded p-2 print:p-1">
          <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Menu Items</h2>
          {booking.menuItems && booking.menuItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-1">
              {booking.menuItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded p-1 border border-gray-200 print:p-0.5">
                  <span className="text-xs font-medium text-gray-800 print-small">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-xs print-small">No menu items</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="border border-gray-200 rounded p-2 print:p-1 mb-3">
          <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Payment Details</h2>
          <div className="space-y-1">
            <div className="flex justify-between text-xs print-small">
              <span className="text-gray-600">Per Head:</span>
              <span className="font-medium">₨{booking.costPerHead?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between text-xs print-small">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-gray-900">₨{totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs print-small">
              <span className="text-gray-600">Advance:</span>
              <span className="font-medium text-green-600">₨{advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200 text-xs print-small">
              <span className="text-gray-600 font-medium">Balance:</span>
              <span className="font-bold text-gray-900">₨{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Additional Charges - Only show if there are charges */}
        {(booking.djCharges > 0 || booking.decorCharges > 0 || booking.tmaCharges > 0 || booking.otherCharges > 0) && (
          <div className="border border-gray-200 rounded p-2 print:p-1 mb-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Additional Charges</h2>
            <div className="space-y-1">
              {booking.djCharges > 0 && (
                <div className="flex justify-between text-xs print-small">
                  <span className="text-gray-600">DJ Charges:</span>
                  <span className="font-medium">₨{booking.djCharges.toLocaleString()}</span>
                </div>
              )}
              {booking.decorCharges > 0 && (
                <div className="flex justify-between text-xs print-small">
                  <span className="text-gray-600">Decor Charges:</span>
                  <span className="font-medium">₨{booking.decorCharges.toLocaleString()}</span>
                </div>
              )}
              {booking.tmaCharges > 0 && (
                <div className="flex justify-between text-xs print-small">
                  <span className="text-gray-600">TMA Charges:</span>
                  <span className="font-medium">₨{booking.tmaCharges.toLocaleString()}</span>
                </div>
              )}
              {booking.otherCharges > 0 && (
                <div className="flex justify-between text-xs print-small">
                  <span className="text-gray-600">Other Charges:</span>
                  <span className="font-medium">₨{booking.otherCharges.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Notes - Only show if there are notes */}
        {booking.specialNotes && (
          <div className="border border-gray-200 rounded p-2 print:p-1 mb-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200 print-small">Special Notes</h2>
            <p className="text-xs text-gray-700 print-small">{booking.specialNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs print-small mb-2">
          <p>Thank you for choosing our services!</p>
          <p className="mt-1">{booking.contactNumber}</p>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 no-print">
          <Button 
            variant="primary" 
            onClick={handlePrint}
            className="w-full sm:w-auto py-1 px-3 text-sm"
          >
            Print Receipt
          </Button>
          {/* Added WhatsApp Share Button */}
          <Button 
            variant="secondary" 
            onClick={handleShareViaWhatsApp}
            className="w-full sm:w-auto py-1 px-3 text-sm"
          >
            Share via WhatsApp
          </Button>
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="w-full sm:w-auto py-1 px-3 text-sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingReceipt;