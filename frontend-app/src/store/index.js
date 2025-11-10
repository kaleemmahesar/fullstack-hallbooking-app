import { configureStore } from '@reduxjs/toolkit';
import bookingsReducer from './slices/bookingsSlice';
import expensesReducer from './slices/expensesSlice';
import vendorsReducer from './slices/vendorsSlice'; // Add vendors reducer

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    expenses: expensesReducer,
    vendors: vendorsReducer // Add vendors reducer
  },
});

export default store;