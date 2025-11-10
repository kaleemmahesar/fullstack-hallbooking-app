import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { addBooking, updateBooking } from '../store/slices/bookingsSlice';
import BookingReceipt from '../components/BookingReceipt';
import { FUNCTION_TYPES, PREDEFINED_MENU_ITEMS } from '../models/Booking';
import { shareBookingConfirmation } from '../utils/sharingUtils'; // Added import for sharing utilities

// Validation schema
const bookingValidationSchema = Yup.object({
  functionDate: Yup.date().required('Function date is required'),
  guests: Yup.number().required('Number of guests is required').positive('Must be a positive number').integer(),
  functionType: Yup.string().required('Function type is required'),
  bookingBy: Yup.string().required('Booking person name is required'),
  address: Yup.string().required('Address is required'),
  cnic: Yup.string().required('CNIC is required').matches(/^\d{13}$/, 'CNIC must be in the format 1234512345671'),
  contactNumber: Yup.string().required('Contact number is required').matches(/^03\d{9}$/, 'Contact number must be in the format 03001234567'),
  startTime: Yup.string().required('Start time is required'),
  endTime: Yup.string().required('End time is required'),
  bookingDays: Yup.number().required('Number of booking days is required').positive('Must be a positive number').integer().min(1, 'Must be at least 1 day'),
  bookingType: Yup.string().required('Booking type is required'),
  costPerHead: Yup.number().when('bookingType', {
    is: 'perHead',
    then: schema => schema.required('Cost per head is required').positive('Must be a positive number').integer(),
    otherwise: schema => schema.nullable()
  }),
  fixedRate: Yup.number().when('bookingType', {
    is: 'fixed',
    then: schema => schema.required('Fixed rate is required').positive('Must be a positive number').integer(),
    otherwise: schema => schema.nullable()
  }),
  advance: Yup.number().nullable().positive('Must be a positive number').integer(),
  djCharges: Yup.number().nullable().integer().min(0, 'Must be a positive number'),
  decorCharges: Yup.number().nullable().integer().min(0, 'Must be a positive number'),
  tmaCharges: Yup.number().nullable().integer().min(0, 'Must be a positive number'),
  otherCharges: Yup.number().nullable().integer().min(0, 'Must be a positive number')
});

const BookingFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  // Get all bookings for validation
  const allBookings = useSelector(state => state.bookings.bookings);
  
  // State for showing receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  
  // Check if we're editing an existing booking
  const isEditing = !!id;
  const existingBooking = useSelector(state => 
    state.bookings.bookings.find(booking => booking.id === id)
  );

  // Initial form values
  const initialValues = {
    functionDate: isEditing ? existingBooking.functionDate : new Date().toISOString().split('T')[0],
    guests: isEditing ? existingBooking.guests : '',
    functionType: isEditing ? existingBooking.functionType : '',
    bookingBy: isEditing ? existingBooking.bookingBy : '',
    address: isEditing ? existingBooking.address : '',
    cnic: isEditing ? existingBooking.cnic : '',
    contactNumber: isEditing ? existingBooking.contactNumber : '',
    startTime: isEditing ? existingBooking.startTime : '18:00',
    endTime: isEditing ? existingBooking.endTime : '23:00',
    bookingDays: isEditing ? existingBooking.bookingDays : 1,
    bookingType: isEditing ? existingBooking.bookingType : 'perHead',
    costPerHead: isEditing && existingBooking.bookingType === 'perHead' ? existingBooking.costPerHead : '',
    fixedRate: isEditing && existingBooking.bookingType === 'fixed' ? existingBooking.fixedRate : '',
    advance: isEditing ? existingBooking.advance : '',
    djCharges: isEditing ? existingBooking.djCharges : '',
    decorCharges: isEditing ? existingBooking.decorCharges : '',
    tmaCharges: isEditing ? existingBooking.tmaCharges : '',
    otherCharges: isEditing ? existingBooking.otherCharges : '',
    specialNotes: isEditing ? existingBooking.specialNotes : '',
    selectedMenuItems: isEditing ? existingBooking.menuItems.filter(item => PREDEFINED_MENU_ITEMS.includes(item)) : [],
    customMenuItems: isEditing ? existingBooking.menuItems.filter(item => !PREDEFINED_MENU_ITEMS.includes(item)) : ['']
  };

  // Custom validation for time slots
  const validateTimeSlots = (values) => {
    const errors = {};
    
    // Skip validation for editing existing bookings
    if (isEditing) return errors;
    
    // Check if function date is provided
    if (!values.functionDate) return errors;
    
    const selectedDate = new Date(values.functionDate);
    const selectedStartTime = values.startTime;
    const selectedEndTime = values.endTime;
    
    // Check for overlapping bookings on the same date
    const overlappingBooking = allBookings.find(booking => {
      const bookingDate = new Date(booking.functionDate);
      
      // Check if it's the same date
      if (bookingDate.toDateString() !== selectedDate.toDateString()) {
        return false;
      }
      
      // Check if time slots overlap
      const bookingStartTime = booking.startTime;
      const bookingEndTime = booking.endTime;
      
      // Convert times to minutes for easier comparison
      const selectedStartMinutes = parseInt(selectedStartTime.split(':')[0]) * 60 + parseInt(selectedStartTime.split(':')[1]);
      const selectedEndMinutes = parseInt(selectedEndTime.split(':')[0]) * 60 + parseInt(selectedEndTime.split(':')[1]);
      const bookingStartMinutes = parseInt(bookingStartTime.split(':')[0]) * 60 + parseInt(bookingStartTime.split(':')[1]);
      const bookingEndMinutes = parseInt(bookingEndTime.split(':')[0]) * 60 + parseInt(bookingEndTime.split(':')[1]);
      
      // Check for overlap
      return (
        (selectedStartMinutes >= bookingStartMinutes && selectedStartMinutes < bookingEndMinutes) ||
        (selectedEndMinutes > bookingStartMinutes && selectedEndMinutes <= bookingEndMinutes) ||
        (selectedStartMinutes <= bookingStartMinutes && selectedEndMinutes >= bookingEndMinutes)
      );
    });
    
    if (overlappingBooking) {
      errors.startTime = 'Selected time slot overlaps with an existing booking';
      errors.endTime = 'Selected time slot overlaps with an existing booking';
    }
    
    return errors;
  };

  const handleSubmit = (values, { setSubmitting, setFieldError }) => {
    // Validate time slots
    const timeSlotErrors = validateTimeSlots(values);
    if (Object.keys(timeSlotErrors).length > 0) {
      Object.keys(timeSlotErrors).forEach(field => {
        setFieldError(field, timeSlotErrors[field]);
      });
      setSubmitting(false);
      return;
    }
    
    // Calculate total cost including additional charges
    let totalCost = 0;
    if (values.bookingType === 'perHead' && values.guests && values.costPerHead) {
      totalCost = (parseInt(values.guests) || 0) * (parseInt(values.costPerHead) || 0) * (parseInt(values.bookingDays) || 1);
    } else if (values.bookingType === 'fixed' && values.fixedRate) {
      totalCost = (parseInt(values.fixedRate) || 0) * (parseInt(values.bookingDays) || 1);
    }
    
    // Add additional charges
    const djCharges = parseInt(values.djCharges) || 0;
    const decorCharges = parseInt(values.decorCharges) || 0;
    const tmaCharges = parseInt(values.tmaCharges) || 0;
    const otherCharges = parseInt(values.otherCharges) || 0;
    totalCost += djCharges + decorCharges + tmaCharges + otherCharges;

    // Combine selected and custom menu items
    const allMenuItems = [
      ...values.selectedMenuItems,
      ...values.customMenuItems.filter(item => item.trim() !== '')
    ];

    // Prepare booking data
    const bookingData = {
      ...values,
      guests: parseInt(values.guests) || 0,
      bookingDays: parseInt(values.bookingDays) || 1,
      costPerHead: values.costPerHead ? parseInt(values.costPerHead) : 0,
      fixedRate: values.fixedRate ? parseInt(values.fixedRate) : 0,
      advance: values.advance ? parseInt(values.advance) : 0,
      djCharges: values.djCharges ? parseInt(values.djCharges) : 0,
      decorCharges: values.decorCharges ? parseInt(values.decorCharges) : 0,
      tmaCharges: values.tmaCharges ? parseInt(values.tmaCharges) : 0,
      otherCharges: values.otherCharges ? parseInt(values.otherCharges) : 0,
      specialNotes: values.specialNotes || '',
      totalCost: totalCost,
      menuItems: allMenuItems,
      bookingDate: new Date().toISOString()
    };

    // Dispatch appropriate action
    if (isEditing) {
      dispatch(updateBooking({ ...existingBooking, ...bookingData }))
        .then(() => {
          alert('Booking updated successfully!');
          setSubmitting(false);
          // For edit, we don't show receipt, just go back to bookings
          navigate('/bookings');
        })
        .catch(() => {
          alert('Failed to update booking.');
          setSubmitting(false);
        });
    } else {
      dispatch(addBooking(bookingData))
        .then((result) => {
          alert('Booking saved successfully!');
          setSubmitting(false);
          // Show receipt after successful booking
          setSubmittedBooking(result.payload);
          setShowReceipt(true);
          
          // Automatically share booking confirmation via WhatsApp and send SMS
          shareBookingConfirmation(result.payload);
        })
        .catch(() => {
          alert('Failed to save booking.');
          setSubmitting(false);
        });
    }
  };

  // Auto-calculate total cost
  const calculateTotalCost = (values) => {
    let baseCost = 0;
    if (values.bookingType === 'perHead' && values.guests && values.costPerHead) {
      baseCost = (parseInt(values.guests) || 0) * (parseInt(values.costPerHead) || 0) * (parseInt(values.bookingDays) || 1);
    } else if (values.bookingType === 'fixed' && values.fixedRate) {
      // Fixed rate means fixed, regardless of number of days
      baseCost = parseInt(values.fixedRate) || 0;
    }
    
    // Add additional charges
    const djCharges = parseInt(values.djCharges) || 0;
    const decorCharges = parseInt(values.decorCharges) || 0;
    const tmaCharges = parseInt(values.tmaCharges) || 0;
    const otherCharges = parseInt(values.otherCharges) || 0;
    
    return baseCost + djCharges + decorCharges + tmaCharges + otherCharges;
  };

  // Calculate balance
  const calculateBalance = (values) => {
    const total = calculateTotalCost(values);
    const advance = parseFloat(values.advance) || 0;
    return total - advance;
  };

  // Handle receipt close
  const handleReceiptClose = () => {
    setShowReceipt(false);
    navigate('/bookings');
  };

  // If showing receipt, render the receipt component
  if (showReceipt && submittedBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <BookingReceipt booking={submittedBooking} onClose={handleReceiptClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Booking' : 'New Booking'}
          </h1>
          <Link 
            to="/bookings" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-center"
          >
            Back to Bookings
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={bookingValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, setFieldValue, errors, handleChange, handleBlur, touched }) => {
              const totalCost = calculateTotalCost(values);
              const balance = calculateBalance(values);
              
              return (
                <Form>
                  {/* Event Details Section */}
                  <div className="mb-3 md:mb-3">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      Event Details
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {/* First Row: Function Type, Booking By, Address */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Function Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="functionType"
                            value={values.functionType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.functionType && touched.functionType ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Select function type</option>
                            {FUNCTION_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.functionType && touched.functionType && (
                            <p className="mt-1 text-sm text-red-500">{errors.functionType}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking By <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="bookingBy"
                            value={values.bookingBy}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.bookingBy && touched.bookingBy ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Person's name"
                          />
                          {errors.bookingBy && touched.bookingBy && (
                            <p className="mt-1 text-sm text-red-500">{errors.bookingBy}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.address && touched.address ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Full address"
                          />
                          {errors.address && touched.address && (
                            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                          )}
                        </div>
                      </div>

                      {/* Third Row: Function Date, Number of Guests, Booking Days */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Function Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="functionDate"
                            value={values.functionDate}
                            onChange={(e) => setFieldValue('functionDate', e.target.value)}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.functionDate && touched.functionDate ? 'border-red-500' : 'border-gray-300'}`}
                            min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
                          />
                          {errors.functionDate && touched.functionDate && (
                            <p className="mt-1 text-sm text-red-500">{errors.functionDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Guests <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="guests"
                            value={values.guests}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.guests && touched.guests ? 'border-red-500' : 'border-gray-300'}`}
                            min="1"
                          />
                          {errors.guests && touched.guests && (
                            <p className="mt-1 text-sm text-red-500">{errors.guests}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Booking Days <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="bookingDays"
                            value={values.bookingDays}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.bookingDays && touched.bookingDays ? 'border-red-500' : 'border-gray-300'}`}
                            min="1"
                          />
                          {errors.bookingDays && touched.bookingDays && (
                            <p className="mt-1 text-sm text-red-500">{errors.bookingDays}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Second Row: CNIC, Contact Number, Event Time */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CNIC <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="cnic"
                            value={values.cnic}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.cnic && touched.cnic ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="1234512345671"
                          />
                          {errors.cnic && touched.cnic && (
                            <p className="mt-1 text-sm text-red-500">{errors.cnic}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="contactNumber"
                            value={values.contactNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${errors.contactNumber && touched.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="03001234567"
                          />
                          {errors.contactNumber && touched.contactNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                          )}
                        </div>
                        
                        {/* Event Time - Start and End Time in same column */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Time <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="time"
                                name="startTime"
                                value={values.startTime}
                                onChange={(e) => setFieldValue('startTime', e.target.value)}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded-md ${errors.startTime && touched.startTime ? 'border-red-500' : 'border-gray-300'}`}
                              />
                              {errors.startTime && touched.startTime && (
                                <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="time"
                                name="endTime"
                                value={values.endTime}
                                onChange={(e) => setFieldValue('endTime', e.target.value)}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded-md ${errors.endTime && touched.endTime ? 'border-red-500' : 'border-gray-300'}`}
                              />
                              {errors.endTime && touched.endTime && (
                                <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Start Time</span>
                            <span>End Time</span>
                          </div>
                        </div>
                      </div>
                      
                      
                    </div>
                  </div>


                  {/* Pricing Section */}
                  <div className="mb-3 md:mb-3">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="bookingType"
                            value="perHead"
                            checked={values.bookingType === 'perHead'}
                            onChange={handleChange}
                            className="text-indigo-600"
                          />
                          <span className="ml-2">Per Head</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="bookingType"
                            value="fixed"
                            checked={values.bookingType === 'fixed'}
                            onChange={handleChange}
                            className="text-indigo-600"
                          />
                          <span className="ml-2">Fixed Rate</span>
                        </label>
                      </div>
                      {errors.bookingType && (
                        <p className="mt-1 text-sm text-red-500">{errors.bookingType}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {values.bookingType === 'perHead' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cost Per Head (₨) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="costPerHead"
                            value={values.costPerHead || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.costPerHead ? 'border-red-500' : 'border-gray-300'}`}
                            min="1"
                            placeholder="Cost per head"
                          />
                          {errors.costPerHead && (
                            <p className="mt-1 text-sm text-red-500">{errors.costPerHead}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fixed Rate (₨) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="fixedRate"
                            value={values.fixedRate || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.fixedRate ? 'border-red-500' : 'border-gray-300'}`}
                            min="1"
                            placeholder="Fixed rate"
                          />
                          {errors.fixedRate && (
                            <p className="mt-1 text-sm text-red-500">{errors.fixedRate}</p>
                          )}
                        </div>
                      )}
                    
                      {/* Additional Charges Fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          DJ Charges (₨)
                        </label>
                        <input
                          type="number"
                          name="djCharges"
                          value={values.djCharges || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          placeholder="DJ charges"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Decor Charges (₨)
                        </label>
                        <input
                          type="number"
                          name="decorCharges"
                          value={values.decorCharges || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          placeholder="Decor charges"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TMA Charges (₨)
                        </label>
                        <input
                          type="number"
                          name="tmaCharges"
                          value={values.tmaCharges || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          placeholder="TMA charges"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other Charges (₨)
                        </label>
                        <input
                          type="number"
                          name="otherCharges"
                          value={values.otherCharges || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                          placeholder="Any other charges"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items Section */}
                  <div className="mb-3 md:mb-3">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Menu Items
                      </label>
                      <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {PREDEFINED_MENU_ITEMS.map((item, index) => (
                            <label key={index} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={values.selectedMenuItems.includes(item)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('selectedMenuItems', [...values.selectedMenuItems, item]);
                                  } else {
                                    setFieldValue('selectedMenuItems', values.selectedMenuItems.filter(i => i !== item));
                                  }
                                }}
                                className="text-indigo-600 rounded w-5 h-5"
                              />
                              <span className="ml-2 text-base">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Menu Items
                      </label>
                      <div className="p-4 border border-gray-300 rounded-md">
                        <FieldArray name="customMenuItems">
                          {({ push, remove }) => (
                            <div>
                              {values.customMenuItems && values.customMenuItems.length > 0 ? (
                                values.customMenuItems.map((item, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row mb-2 gap-2">
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newItems = [...values.customMenuItems];
                                        newItems[index] = e.target.value;
                                        setFieldValue('customMenuItems', newItems);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                      placeholder="Custom menu item"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      disabled={values.customMenuItems.length === 1 && values.customMenuItems[0] === ''}
                                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              ) : null}
                              
                              <button
                                type="button"
                                onClick={() => push('')}
                                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Add Custom Item
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  </div>

                  
                  {/* Special Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Notes
                    </label>
                    <textarea
                      name="specialNotes"
                      value={values.specialNotes || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Any special notes or requirements for this booking"
                    ></textarea>
                  </div>

                  {/* Payment Section */}
                  <div className="mb-6 md:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Cost
                        </label>
                        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                          <span className="font-semibold">₨{totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Advance Payment (₨)
                        </label>
                        <input
                          type="number"
                          name="advance"
                          value={values.advance || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${errors.advance ? 'border-red-500' : 'border-gray-300'}`}
                          min="0"
                          placeholder="Advance amount"
                        />
                        {errors.advance && (
                          <p className="mt-1 text-sm text-red-500">{errors.advance}</p>
                        )}
                      </div>
                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Balance Due
                        </label>
                        <div className={`px-3 py-2 border rounded-md ${balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                          <span className={`font-semibold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                            ₨{balance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    
                      <div className="lg:col-span-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                          <p>
                            <span className="font-medium">Note:</span> Total cost is calculated as {values.bookingType === 'perHead' 
                              ? `((Number of Guests × Cost Per Head) × Booking Days)` 
                              : `(Fixed Rate × Booking Days)`} plus additional charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                    <Link 
                      to="/bookings"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-center"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Saving...' : (isEditing ? 'Update Booking' : 'Save Booking')}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default BookingFormPage;