import * as api from '../api/mockApi';

// Vendor service functions
export const fetchVendors = async () => {
  try {
    const response = await api.getVendors();
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch vendors');
  }
};

export const createVendor = async (vendorData) => {
  try {
    const response = await api.createVendor(vendorData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to create vendor');
  }
};

export const updateVendor = async (id, vendorData) => {
  try {
    const response = await api.updateVendor(id, vendorData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to update vendor');
  }
};

export const deleteVendor = async (id) => {
  try {
    const response = await api.deleteVendor(id);
    return response;
  } catch (error) {
    // Pass through the actual error message from the backend
    const errorMessage = error.response?.data?.error || error.message || 'Failed to delete vendor';
    throw new Error(errorMessage);
  }
};

// Transaction service functions
export const fetchVendorTransactions = async (vendorId) => {
  try {
    const response = await api.getVendorTransactions(vendorId);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch vendor transactions');
  }
};

export const createVendorTransaction = async (transactionData) => {
  try {
    const response = await api.createVendorTransaction(transactionData);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to create vendor transaction');
  }
};