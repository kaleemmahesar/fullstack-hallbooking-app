import * as api from '../api/mockApi';

// Booking service functions
export const fetchBookings = async () => {
  try {
    const response = await api.getBookings();
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch bookings');
  }
};

export const fetchBookingById = async (id) => {
  try {
    const response = await api.getBookingById(id);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch booking');
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await api.createBooking(bookingData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to create booking');
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.updateBooking(id, bookingData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to update booking');
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await api.deleteBooking(id);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete booking');
  }
};