import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Predefined toast functions
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'top-right',
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    position: 'top-right',
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    position: 'top-right',
    duration: 3000,
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  });
};

// Toast container component
const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{}}
    />
  );
};

export default Toast;