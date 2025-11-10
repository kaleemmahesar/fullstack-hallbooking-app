import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Vendor, VendorTransaction } from '../../models/Vendor';
import * as vendorService from '../../services/vendorService';

// Async thunks for API calls
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async () => {
    const vendors = await vendorService.fetchVendors();
    return vendors;
  }
);

export const addVendor = createAsyncThunk(
  'vendors/addVendor',
  async (vendorData) => {
    const newVendor = await vendorService.createVendor(vendorData);
    // Return plain object instead of class instance
    return newVendor;
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async (vendorData) => {
    const updatedVendor = await vendorService.updateVendor(vendorData.id, vendorData);
    // Return plain object instead of class instance
    return updatedVendor;
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (vendorId) => {
    await vendorService.deleteVendor(vendorId);
    return vendorId;
  }
);

// Transaction thunks
export const fetchVendorTransactions = createAsyncThunk(
  'vendors/fetchVendorTransactions',
  async (vendorId) => {
    const transactions = await vendorService.fetchVendorTransactions(vendorId);
    return { vendorId, transactions };
  }
);

export const addVendorTransaction = createAsyncThunk(
  'vendors/addVendorTransaction',
  async (transactionData) => {
    const newTransaction = await vendorService.createVendorTransaction(transactionData);
    // Return plain object instead of class instance
    return newTransaction;
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: {
    vendors: [],
    transactions: {}, // Store transactions by vendorId
    status: 'idle',
    error: null
  },
  reducers: {
    // Synchronous reducers can be added here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store plain objects instead of class instances
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        // Store plain object instead of class instance
        state.vendors.push(action.payload);
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(vendor => vendor.id === action.payload.id);
        if (index !== -1) {
          // Store plain object instead of class instance
          state.vendors[index] = action.payload;
        }
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(vendor => vendor.id !== action.payload);
      })
      .addCase(fetchVendorTransactions.fulfilled, (state, action) => {
        const { vendorId, transactions } = action.payload;
        // Store plain objects instead of class instances
        // Sort transactions by date (newest first)
        const sortedTransactions = transactions.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateB - dateA !== 0) {
            return dateB - dateA;
          }
          return b.id - a.id; // If dates are equal, sort by ID
        });
        state.transactions[vendorId] = sortedTransactions;
      })
      .addCase(addVendorTransaction.fulfilled, (state, action) => {
        const transaction = action.payload;
        if (!state.transactions[transaction.vendorId]) {
          state.transactions[transaction.vendorId] = [];
        }
        state.transactions[transaction.vendorId].push(transaction);
        
        // Update vendor totals in the state to reflect the new transaction
        const vendor = state.vendors.find(v => v.id === transaction.vendorId);
        if (vendor) {
          if (transaction.type === 'credit') {
            vendor.totalCredit += transaction.amount;
          } else if (transaction.type === 'payment') {
            vendor.totalPaid += transaction.amount;
          }
          // Recalculate the balance to ensure consistency
          const balance = vendor.totalCredit - vendor.totalPaid;
          // Ensure the vendor object is updated with the new balance
          vendor.balance = balance;
        }
      });
  }
});

export default vendorsSlice.reducer;