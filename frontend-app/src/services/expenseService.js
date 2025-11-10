import * as api from '../api/mockApi';

// Expense service functions
export const fetchExpenses = async () => {
  try {
    const response = await api.getExpenses();
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch expenses');
  }
};

export const fetchExpensesByBookingId = async (bookingId) => {
  try {
    const response = await api.getExpensesByBookingId(bookingId);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch expenses');
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await api.createExpense(expenseData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to create expense');
  }
};

export const updateExpense = async (expenseData) => {
  try {
    const response = await api.updateExpense(expenseData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to update expense');
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.deleteExpense(id);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete expense');
  }
};