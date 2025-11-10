import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const CalendarPage = () => {
  const { bookings, status } = useSelector(state => state.bookings);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

  // Get events for the current month
  const getEventsForMonth = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    
    return bookings.filter(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(currentDate, 'month');
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return bookings.filter(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(date, 'day');
    });
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventsForSelectedDate(getEventsForDate(date));
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(null);
    setEventsForSelectedDate([]);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    
    const days = [];
    let day = startDate;
    
    while (day.isBefore(endDate)) {
      days.push(day);
      day = day.add(1, 'day');
    }
    
    return days;
  };

  // Check if a date has events
  const hasEvents = (date) => {
    return bookings.some(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(date, 'day');
    });
  };

  // Get day class names
  const getDayClassNames = (day) => {
    let classNames = 'h-20 md:h-24 p-1 border border-gray-200 relative';
    
    // Current month
    if (day.isSame(currentDate, 'month')) {
      classNames += ' bg-white';
    } else {
      classNames += ' bg-gray-50 text-gray-400';
    }
    
    // Today
    if (day.isSame(dayjs(), 'day')) {
      classNames += ' bg-blue-50';
    }
    
    // Selected date
    if (selectedDate && day.isSame(selectedDate, 'day')) {
      classNames += ' ring-2 ring-indigo-500';
    }
    
    return classNames;
  };

  // Get events for a specific day to display in the calendar cell
  const getDayEvents = (date) => {
    return bookings.filter(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(date, 'day');
    });
  };

  const calendarDays = generateCalendarDays();
  const eventsForMonth = getEventsForMonth();

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
          <p className="text-gray-600 mt-1">View upcoming events and bookings</p>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mx-4">
                {currentDate.format('MMMM YYYY')}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="ml-4 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                Today
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-medium">{eventsForMonth.length}</span> events this month
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {weekdays.map((day) => (
              <div key={day} className="py-2 md:py-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getDayEvents(day);
              return (
                <div
                  key={index}
                  className={getDayClassNames(day)}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm ${day.isSame(currentDate, 'month') ? 'font-medium' : ''}`}>
                      {day.date()}
                    </span>
                    {hasEvents(day) && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    )}
                  </div>
                  
                  {/* Event indicators with time */}
                  <div className="mt-1 space-y-1 max-h-16 overflow-y-auto">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-indigo-100 text-indigo-800 rounded truncate"
                        title={`${event.functionType} - ${event.bookingBy} (${event.guests} guests)`}
                      >
                        <div className="font-medium truncate">{event.functionType}</div>
                        <div className="truncate">{event.startTime} - {event.endTime}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && eventsForSelectedDate.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Events on {selectedDate.format('dddd, MMMM D, YYYY')}
            </h3>
            <div className="space-y-3">
              {eventsForSelectedDate.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-900">{event.functionType}</h4>
                    <span className="text-sm text-gray-500">{event.guests} guests</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Booked by: {event.bookingBy}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Time: {event.startTime} - {event.endTime}</span>
                    <span className="text-sm font-medium text-indigo-600">
                      ₨{event.totalCost?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No events message */}
        {selectedDate && eventsForSelectedDate.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no events scheduled for {selectedDate.format('MMMM D, YYYY')}.
            </p>
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading events...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;