import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost/hall-booking-app/backend', // Reverted to the working URL structure
  timeout: 10000,
  withCredentials: true // Enable cookies for session management
});

// Add interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/hall-booking-app/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/api/logout');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Logout failed');
  }
};

// Booking API functions
export const getBookings = async () => {
  try {
    const response = await api.get('/api/bookings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch bookings');
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch booking');
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create booking');
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/api/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update booking');
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await api.delete(`/api/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete booking');
  }
};

// Payment API functions
export const addPayment = async (bookingId, paymentData) => {
  try {
    const response = await api.post(`/api/bookings/${bookingId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add payment');
  }
};

export const getPayments = async (bookingId) => {
  try {
    const response = await api.get(`/api/bookings/${bookingId}/payments`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch payments');
  }
};

// Expense API functions
export const getExpenses = async () => {
  try {
    const response = await api.get('/api/expenses');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch expenses');
  }
};

export const getExpensesByBookingId = async (bookingId) => {
  try {
    const response = await api.get(`/api/expenses/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch expenses');
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await api.post('/api/expenses', expenseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create expense');
  }
};

export const updateExpense = async (expenseData) => {
  try {
    const response = await api.put('/api/expenses', expenseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update expense');
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete expense');
  }
};

// Vendor API functions
export const getVendors = async () => {
  try {
    const response = await api.get('/api/vendors');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch vendors');
  }
};

export const createVendor = async (vendorData) => {
  try {
    const response = await api.post('/api/vendors', vendorData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create vendor');
  }
};

export const updateVendor = async (id, vendorData) => {
  try {
    const response = await api.put(`/api/vendors/${id}`, vendorData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update vendor');
  }
};

export const deleteVendor = async (id) => {
  try {
    const response = await api.delete(`/api/vendors/${id}`);
    return response.data;
  } catch (error) {
    // Pass through the actual error message from the backend
    const errorMessage = error.response?.data?.error || error.message || 'Failed to delete vendor';
    throw new Error(errorMessage);
  }
};

// Vendor transaction API functions
export const getVendorTransactions = async (vendorId) => {
  try {
    const response = await api.get(`/api/vendor-transactions/${vendorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch vendor transactions');
  }
};

export const createVendorTransaction = async (transactionData) => {
  try {
    const response = await api.post('/api/vendor-transactions', transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create vendor transaction');
  }
};

export default api;