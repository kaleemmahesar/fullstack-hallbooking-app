import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as expenseService from '../../services/expenseService';
import { Expense } from '../../models/Expense';

// Async thunks for API calls
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    const expenses = await expenseService.fetchExpenses();
    return expenses;
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expenseData) => {
    const newExpense = await expenseService.createExpense(expenseData);
    // Return plain object instead of class instance
    return newExpense;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expenseData) => {
    const updatedExpense = await expenseService.updateExpense(expenseData.id, expenseData);
    // Return plain object instead of class instance
    return updatedExpense;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId) => {
    await expenseService.deleteExpense(expenseId);
    return expenseId;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    status: 'idle',
    error: null
  },
  reducers: {
    // Synchronous reducers can be added here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store plain objects instead of class instances
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        // Store plain object instead of class instance
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          // Store plain object instead of class instance
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
      });
  }
});

export default expensesSlice.reducer;