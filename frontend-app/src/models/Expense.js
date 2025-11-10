// Expense data model
export class Expense {
  constructor({
    id = '',
    bookingId = '',
    title = '',
    category = '',
    amount = 0,
    receiptImage = '', // URL or base64 string of the receipt image
    vendor = '', // Vendor name for the expense
    paymentStatus = 'paid', // 'paid' or 'credit'
    dueDate = '', // Due date for credit expenses
    paymentHistory = [] // Array of payment records
  } = {}) {
    this.id = id;
    this.bookingId = bookingId;
    this.title = title;
    this.category = category;
    this.amount = amount;
    this.receiptImage = receiptImage; // URL or base64 string of the receipt image
    this.vendor = vendor; // Vendor name for the expense
    this.paymentStatus = paymentStatus; // 'paid' or 'credit'
    this.dueDate = dueDate; // Due date for credit expenses
    this.paymentHistory = paymentHistory; // Array of payment records
  }
}

// Predefined expense categories
export const EXPENSE_CATEGORIES = [
  'Labour Cost',
  'Maintenance',
  'Decoration',
  'Groceries',
  'Other'
];

// Payment status options
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'credit', label: 'Credit' }
];