import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import BookingFormPage from './pages/BookingFormPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import ExpenseManagementPage from './pages/ExpenseManagementPage';
import VendorManagementPage from './pages/VendorManagementPage'; // Add Vendor Management page
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <Layout><BookingsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings/new" element={
        <ProtectedRoute>
          <Layout><BookingFormPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings/edit/:id" element={
        <ProtectedRoute>
          <Layout><BookingFormPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings/:id" element={
        <ProtectedRoute>
          <Layout><BookingFormPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout><OrderSummaryPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <Layout><ExpenseManagementPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendors" element={ // Add Vendor Management route
        <ProtectedRoute>
          <Layout><VendorManagementPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;