# Wedding Hall Management System - Sharing Feature

## Overview
This document explains the implementation of the sharing feature that allows users to share booking confirmations via WhatsApp and send SMS notifications to both customers and hall owners.

## Features Implemented

### 1. WhatsApp Sharing
- Share booking slips directly via WhatsApp
- Pre-formatted message with all booking details
- Opens WhatsApp Web with pre-filled message

### 2. SMS Notifications
- Automatic SMS notifications to customers upon booking
- Notification to hall owner with booking details
- Simulated in this version (can be connected to real SMS API)

## Implementation Details

### Utility Functions
The sharing functionality is implemented in `src/utils/sharingUtils.js` with the following functions:

1. `generateWhatsAppMessage(booking)` - Creates a formatted message for WhatsApp
2. `shareViaWhatsApp(booking, phoneNumber)` - Opens WhatsApp with the message
3. `sendSMSNotifications(booking)` - Sends SMS notifications (simulated)
4. `shareBookingConfirmation(booking)` - Combines both sharing methods

### Integration Points

1. **Booking Receipt Component** - Added a "Share via WhatsApp" button
2. **Booking Card Component** - Added a "Share" button for existing bookings
3. **Booking Form Page** - Automatically shares confirmation after new booking

## How It Works

### For New Bookings
1. User completes a new booking
2. System automatically opens WhatsApp with pre-filled message to customer
3. System sends SMS notifications to both customer and owner (simulated)

### For Existing Bookings
1. User can click the "Share" button on any booking card
2. System opens WhatsApp with booking details
3. User can then send the message to the customer

## Customization

To connect to a real SMS API:
1. Modify the `sendSMSNotifications` function in `src/utils/sharingUtils.js`
2. Add your SMS API credentials
3. Replace the console.log statements with actual API calls

Example integration with a generic SMS API:
```javascript
// Replace the sendSMSNotifications function with:
const sendSMSNotifications = async (booking) => {
  // Customer SMS
  await fetch('https://api.smsprovider.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      to: booking.contactNumber,
      message: `Dear ${booking.bookingBy}, your wedding hall booking (ID: ${booking.id.substring(0, 8)}) has been confirmed.`
    })
  });

  // Owner SMS
  await fetch('https://api.smsprovider.com/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      to: '0300-1234567', // Owner's number
      message: `New booking confirmed for ${booking.bookingBy}. Booking ID: ${booking.id.substring(0, 8)}.`
    })
  });
};
```

## WhatsApp Message Format
The WhatsApp message includes:
- Booking ID
- Customer name
- Function date and time
- Hall information
- Number of guests
- Menu items
- Payment details
- Contact information

## Testing
To test the feature:
1. Create a new booking and observe the automatic WhatsApp sharing
2. View existing bookings and click the "Share" button
3. Check browser console for SMS notification logs

## Limitations
- SMS functionality is simulated in this version
- Requires internet connection for WhatsApp sharing
- WhatsApp must be installed on the user's device for optimal experience