import { generateBookingSlipPDF } from './pdfGenerator';
import axios from 'axios';

/**
 * Format phone number for WhatsApp URL
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number for WhatsApp
 */
const formatPhoneNumberForWhatsApp = (phoneNumber) => {
  // Remove all non-digit characters and add country code if missing
  let formattedNumber = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 03, replace with Pakistan country code 92
  if (formattedNumber.startsWith('03')) {
    formattedNumber = '92' + formattedNumber.substring(1);
  }
  
  // If number doesn't start with country code, assume it's Pakistan
  if (!formattedNumber.startsWith('92')) {
    formattedNumber = '92' + formattedNumber;
  }
  
  return formattedNumber;
};

/**
 * Generate a WhatsApp message for booking confirmation
 * @param {Object} booking - The booking object
 * @returns {string} - Formatted message for WhatsApp
 */
export const generateWhatsAppMessage = (booking) => {
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  const balance = totalCost - advance;
  const perHeadCost = booking.costPerHead || 0;
  
  // Format additional charges
  const additionalCharges = [];
  if (booking.djCharges > 0) additionalCharges.push(`DJ Charges: ₨${booking.djCharges.toLocaleString()}`);
  if (booking.decorCharges > 0) additionalCharges.push(`Decor Charges: ₨${booking.decorCharges.toLocaleString()}`);
  if (booking.tmaCharges > 0) additionalCharges.push(`TMA Charges: ₨${booking.tmaCharges.toLocaleString()}`);
  if (booking.otherCharges > 0) additionalCharges.push(`Other Charges: ₨${booking.otherCharges.toLocaleString()}`);
  
  // Format time to show only hours and minutes
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };
  
  return `*Wedding Hall Booking Confirmation*

*Booking ID:* #${booking.id ? String(booking.id).substring(0, 8) : 'N/A'}
*Customer:* ${booking.bookingBy}
*Function Type:* ${booking.functionType}
*Function Date:* ${new Date(booking.functionDate).toLocaleDateString()}
*Time:* ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}
*Hall:* ${booking.hallReserved || 'Main Hall'}
*Guests:* ${booking.guests}
*Booking Type:* ${booking.bookingType === 'perHead' ? 'Per Head' : 'Fixed Rate'}
${booking.bookingType === 'perHead' ? `*Per Head Cost:* ₨${perHeadCost.toLocaleString()}` : `*Fixed Rate:* ₨${(booking.fixedRate || 0).toLocaleString()}`}

*Menu Items:*
${booking.menuItems && booking.menuItems.length > 0 
  ? booking.menuItems.map(item => `- ${typeof item === 'string' ? item : item.name || 'Unknown Item'}`).join('\n') 
  : 'No specific menu items'}

*Payment Details:*
Total Amount: ₨${totalCost.toLocaleString()}
Advance Paid: ₨${advance.toLocaleString()}
Balance Due: ₨${balance.toLocaleString()}

${additionalCharges.length > 0 ? `*Additional Charges:*
${additionalCharges.join('\n')}

` : ''}*Special Notes:*
${booking.specialNotes || 'No special notes'}

Thank you for choosing our wedding hall services!
For any queries, please contact us at 0300-1234567`;
};

/**
 * Share booking via WhatsApp with PDF attachment
 * @param {Object} booking - The booking object
 */
export const shareViaWhatsApp = async (booking) => {
  // Use the phone number from booking details
  const phoneNumber = booking.contactNumber;
  
  if (!phoneNumber) {
    console.error('No phone number found in booking details');
    alert('No phone number found in booking details');
    return;
  }
  
  // Format phone number for WhatsApp
  const formattedPhoneNumber = formatPhoneNumberForWhatsApp(phoneNumber);
  
  // Generate the WhatsApp message
  const message = generateWhatsAppMessage(booking);
  
  // For web-based WhatsApp, we can't directly attach files
  // Instead, we'll provide a link to download the PDF and include instructions
  const encodedMessage = encodeURIComponent(message + '\n\nPlease find your booking receipt attached as a PDF. You can download it using the link below:');
  
  // Generate PDF and create a blob URL for sharing
  try {
    const pdfBlob = await generateBookingSlipPDF(booking);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Create a temporary link for the PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `booking-receipt-${booking.id ? String(booking.id).substring(0, 8) : 'N/A'}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Open WhatsApp with message (PDF download will happen separately)
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Clean up the blob URL
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to just sending the message
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
};

/**
 * Send SMS notifications to customer and owner
 * @param {Object} booking - The booking object
 */
export const sendSMSNotifications = (booking) => {
  // In a real implementation, this would connect to an SMS API
  // For now, we'll simulate the functionality with console logs and alerts
  
  alert(`SMS Notification to Customer:
To: ${booking.contactNumber}
Message: Dear ${booking.bookingBy}, your wedding hall booking (ID: ${booking.id ? String(booking.id).substring(0, 8) : 'N/A'}) has been confirmed for ${new Date(booking.functionDate).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime}. Total amount: ₨${(booking.totalCost || 0).toLocaleString()}. Thank you!`);
  
  alert(`SMS Notification to Owner:
To: 0300-1234567
Message: New booking confirmed for ${booking.bookingBy} on ${new Date(booking.functionDate).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime}. Booking ID: ${booking.id ? String(booking.id).substring(0, 8) : 'N/A'}. Total amount: ₨${(booking.totalCost || 0).toLocaleString()}.`);
  
  // In a real implementation, you would use an SMS API like:
  // fetch('https://api.smsprovider.com/send', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer YOUR_API_KEY'
  //   },
  //   body: JSON.stringify({
  //     to: booking.contactNumber,
  //     message: `Dear ${booking.bookingBy}, your wedding hall booking has been confirmed.`
  //   })
  // });
};

/**
 * Send SMS notification for booking confirmation using Twilio
 * @param {Object} booking - The booking object
 */
async function sendBookingSMS(booking) {
  // Use the phone number from booking details
  const phoneNumber = booking.contactNumber;
  
  if (!phoneNumber) {
    console.error('No phone number found in booking details');
    return;
  }
  
  // Format phone number for SMS
  const formattedPhoneNumber = formatPhoneNumberForWhatsApp(phoneNumber);
  
  // Calculate booking details
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  const balance = totalCost - advance;
  const perHeadCost = booking.costPerHead || 0;
  const fixedRate = booking.fixedRate || 0;
  
  // Create detailed SMS message
  let message = `*WEDDING HALL BOOKING CONFIRMATION*

`;
  message += `Booking ID: ${booking.id ? String(booking.id).substring(0, 8) : 'N/A'}
`;
  message += `Customer: ${booking.bookingBy}
`;
  message += `Function: ${booking.functionType}
`;
  message += `Date: ${new Date(booking.functionDate).toLocaleDateString()}
`;
  message += `Time: ${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}
`;
  message += `Guests: ${booking.guests}
`;
  message += `Booking Type: ${booking.bookingType === 'perHead' ? 'Per Head' : 'Fixed Rate'}
`;
  
  if (booking.bookingType === 'perHead') {
    message += `Cost Per Head: ₨${perHeadCost.toLocaleString()}
`;
  } else {
    message += `Fixed Rate: ₨${fixedRate.toLocaleString()}
`;
  }
  
  message += `Total Amount: ₨${totalCost.toLocaleString()}
`;
  message += `Advance Paid: ₨${advance.toLocaleString()}
`;
  message += `Balance Due: ₨${balance.toLocaleString()}
`;

  // Add additional charges if any
  const additionalCharges = [];
  if (booking.djCharges > 0) additionalCharges.push(`DJ: ₨${booking.djCharges.toLocaleString()}`);
  if (booking.decorCharges > 0) additionalCharges.push(`Decor: ₨${booking.decorCharges.toLocaleString()}`);
  if (booking.tmaCharges > 0) additionalCharges.push(`TMA: ₨${booking.tmaCharges.toLocaleString()}`);
  if (booking.otherCharges > 0) additionalCharges.push(`Other: ₨${booking.otherCharges.toLocaleString()}`);
  
  if (additionalCharges.length > 0) {
    message += `Additional Charges:
${additionalCharges.join(', ')}
`;
  }
  
  message += `Thank you for choosing our wedding hall services!
`;
  message += `For queries, contact: 0300-1234567`;
  
  // Check if Twilio credentials are available
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
  
  // If credentials are not set, simulate SMS sending
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.log(`📱 SMS would be sent to: +${formattedPhoneNumber}`);
    console.log(`📝 SMS message: ${message}`);
    console.log('✅ SMS Sent (simulated - Twilio credentials not configured)');
    return;
  }
  
  // In a real implementation with Twilio REST API:
  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      `Body=${encodeURIComponent(message)}&From=${encodeURIComponent(twilioPhoneNumber)}&To=${encodeURIComponent('+' + formattedPhoneNumber)}`,
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ SMS Sent:', response.data.sid);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending SMS:', error.response?.data || error.message);
    // Fallback to simulation if Twilio fails
    console.log(`📱 SMS would be sent to: +${formattedPhoneNumber}`);
    console.log(`📝 SMS message: ${message}`);
    console.log('✅ SMS Sent (simulated due to Twilio error)');
  }
}

/**
 * Share booking slip via WhatsApp and send SMS notifications
 * @param {Object} booking - The booking object
 */
export const shareBookingConfirmation = async (booking) => {
  // Share via WhatsApp with customer
  await shareViaWhatsApp(booking);
  
  // Send SMS notifications
  // sendSMSNotifications(booking);
  // sendBookingSMS(booking);
};
