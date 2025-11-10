import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bookingService from '../../services/bookingService';

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async () => {
    const response = await bookingService.fetchBookings();
    return response;
  }
);

export const addBooking = createAsyncThunk(
  'bookings/addBooking',
  async (bookingData) => {
    const response = await bookingService.createBooking(bookingData);
    return response;
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, bookingData }) => {
    const response = await bookingService.updateBooking(id, bookingData);
    return response;
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (bookingId) => {
    await bookingService.deleteBooking(bookingId);
    return bookingId;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    status: 'idle',
    error: null
  },
  reducers: {
    // Add a reducer to update a booking in the store without making an API call
    updateBookingInStore: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = {
          ...action.payload,
          // Only calculate balance if not provided by API
          balance: action.payload.balance !== undefined ? action.payload.balance : (action.payload.totalCost - (action.payload.advance || 0))
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store plain objects instead of class instances
        state.bookings = action.payload.map(booking => ({
          ...booking,
          // Only calculate balance if not provided by API
          balance: booking.balance !== undefined ? booking.balance : (booking.totalCost - (booking.advance || 0))
        }));
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.bookings.push({
          ...action.payload,
          // Only calculate balance if not provided by API
          balance: action.payload.balance !== undefined ? action.payload.balance : (action.payload.totalCost - (action.payload.advance || 0))
        });
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = {
            ...action.payload,
            // Only calculate balance if not provided by API
            balance: action.payload.balance !== undefined ? action.payload.balance : (action.payload.totalCost - (action.payload.advance || 0))
          };
        }
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
      });
  }
});

export const { updateBookingInStore } = bookingsSlice.actions;
export default bookingsSlice.reducer;