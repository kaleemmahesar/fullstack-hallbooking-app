import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Function to generate booking report PDF
export const generateBookingReportPDF = (bookings, expenses, title = 'Booking Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 105, 20, null, null, 'center');
  
  // Add generation date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Prepare data for the table
  const tableData = bookings.map(booking => {
    // Calculate expenses for this booking
    const bookingExpenses = expenses
      .filter(expense => expense.bookingId === booking.id)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    const profit = (booking.totalCost || 0) - bookingExpenses;
    
    return [
      booking.id,
      booking.functionDate ? new Date(booking.functionDate).toLocaleDateString() : '',
      booking.bookingBy,
      `₨${(booking.totalCost || 0).toLocaleString()}`,
      `₨${bookingExpenses.toLocaleString()}`,
      `₨${profit.toLocaleString()}`
    ];
  });
  
  // Add table
  autoTable(doc, {
    head: [['Booking ID', 'Date', 'Customer', 'Total', 'Expenses', 'Profit']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 10
    },
    headStyles: {
      fillColor: [59, 130, 246] // Blue color
    }
  });
  
  // Add summary
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  const totalExpenses = expenses
    .filter(expense => bookings.some(booking => booking.id === expense.bookingId))
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const finalY = doc.lastAutoTable.finalY || 40;
  doc.setFontSize(12);
  doc.text(`Total Revenue: ₨${totalRevenue.toLocaleString()}`, 20, finalY + 10);
  doc.text(`Total Expenses: ₨${totalExpenses.toLocaleString()}`, 20, finalY + 20);
  doc.text(`Net Profit: ₨${netProfit.toLocaleString()}`, 20, finalY + 30);
  
  // Save the PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Function to generate booking slip PDF
export const generateBookingSlipPDF = (booking, expenses = []) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Wedding Hall Booking Slip', 105, 20, null, null, 'center');
  doc.setFontSize(16);
  doc.text('Official Receipt', 105, 30, null, null, 'center');
  
  // Add booking information
  doc.setFontSize(12);
  let yPos = 45;
  
  doc.text(`Booking ID: #${booking.id || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Booking Date: ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Function Date: ${booking.functionDate ? new Date(booking.functionDate).toLocaleDateString() : ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Function Type: ${booking.functionType || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Hall Reserved: ${booking.hallReserved || 'Main Hall'}`, 20, yPos);
  yPos += 10;
  doc.text(`Time: ${booking.startTime || ''} - ${booking.endTime || ''}`, 20, yPos);
  
  // Add customer information
  yPos += 15;
  doc.setFontSize(14);
  doc.text('Customer Information', 20, yPos);
  doc.setFontSize(12);
  yPos += 10;
  doc.text(`Name: ${booking.bookingBy || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`CNIC: ${booking.cnic || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Contact: ${booking.contactNumber || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Address: ${booking.address || ''}`, 20, yPos);
  yPos += 10;
  doc.text(`Guests: ${booking.guests || 0}`, 20, yPos);
  
  // Add menu items
  yPos += 15;
  doc.setFontSize(14);
  doc.text('Menu Details', 20, yPos);
  doc.setFontSize(12);
  
  // Prepare menu items table - handle different menu item structures
  let menuData = [];
  if (booking.menuItems && Array.isArray(booking.menuItems)) {
    if (booking.menuItems.length > 0 && typeof booking.menuItems[0] === 'object') {
      // Handle object structure
      menuData = booking.menuItems.map(item => [
        item.name || '',
        item.quantity || '',
        `₨${(item.cost || 0).toLocaleString()}`
      ]);
    } else {
      // Handle string array structure
      menuData = booking.menuItems.map(item => [
        item,
        'N/A',
        'N/A'
      ]);
    }
  }
  
  // Only add table if we have menu items
  if (menuData.length > 0) {
    autoTable(doc, {
      head: [['Item', 'Quantity', 'Cost (₨)']],
      body: menuData,
      startY: yPos + 5,
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [59, 130, 246] // Blue color
      }
    });
    
    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 30;
  } else {
    yPos += 10;
    doc.text('No menu items selected', 20, yPos);
    yPos += 10;
  }
  
  // Add payment summary
  const totalCost = booking.totalCost || 0;
  const advance = booking.advance || 0;
  const balance = totalCost - advance;
  
  let paymentY = yPos + 15;
  
  doc.setFontSize(14);
  doc.text('Payment Summary', 20, paymentY);
  doc.setFontSize(12);
  paymentY += 10;
  doc.text(`Total Cost: ₨${totalCost.toLocaleString()}`, 20, paymentY);
  paymentY += 10;
  doc.text(`Advance Paid: ₨${advance.toLocaleString()}`, 20, paymentY);
  paymentY += 10;
  doc.text(`Balance: ₨${balance.toLocaleString()}`, 20, paymentY);
  
  // Calculate and add expenses
  const bookingExpenses = expenses
    .filter(expense => expense.bookingId === booking.id)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netProfit = totalCost - bookingExpenses;
  
  paymentY += 10;
  doc.text(`Total Expenses: ₨${bookingExpenses.toLocaleString()}`, 20, paymentY);
  paymentY += 10;
  doc.setFontSize(14);
  doc.text(`Net Profit: ₨${netProfit.toLocaleString()}`, 20, paymentY);
  
  // Add footer
  const footerY = paymentY + 20;
  doc.setFontSize(10);
  doc.text('Thank you for choosing our wedding hall services!', 105, footerY, null, null, 'center');
  doc.text('For any queries, please contact us at 0300-1234567', 105, footerY + 10, null, null, 'center');
  
  // Return as blob for sharing
  return doc.output('blob');
};