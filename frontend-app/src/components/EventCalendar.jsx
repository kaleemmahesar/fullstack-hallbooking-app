import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Link } from 'react-router-dom';

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const EventCalendar = () => {
  const { bookings } = useSelector(state => state.bookings);
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
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

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return bookings.filter(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(date, 'day');
    }).sort((a, b) => {
      // Sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Check if a date has events
  const hasEvents = (date) => {
    return bookings.some(booking => {
      const bookingDate = dayjs(booking.functionDate);
      return bookingDate.isSame(date, 'day');
    });
  };

  // Check if an event is completed (considering both date and time)
  const isEventCompleted = (event) => {
    const eventDateTime = dayjs(`${event.functionDate}T${event.endTime}`);
    const currentDateTime = dayjs();
    return eventDateTime.isBefore(currentDateTime);
  };

  // Get day class names
  const getDayClassNames = (day) => {
    let classNames = 'h-20 p-1 border border-gray-200 relative text-xs';
    
    // Current month
    if (day.isSame(currentDate, 'month')) {
      classNames += ' bg-white';
    } else {
      classNames += ' bg-gray-50 text-gray-400';
    }
    
    // Today
    if (day.isSame(dayjs(), 'day')) {
      classNames += ' bg-blue-50 ring-1 ring-blue-300';
    }
    
    return classNames;
  };

  const calendarDays = generateCalendarDays();

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Event Calendar</h2>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-sm font-medium text-gray-900 mx-1">
            {currentDate.format('MMMM YYYY')}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="ml-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
          >
            Today
          </button>
          <Link to="/calendar" className="ml-1 text-xs text-indigo-600 hover:text-indigo-800">
            View Full Calendar
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekdays.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={index}
                className={getDayClassNames(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs ${day.isSame(currentDate, 'month') ? 'font-medium' : ''}`}>
                    {day.date()}
                  </span>
                  {hasEvents(day) && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  )}
                </div>
                
                {/* Event indicators sorted by time */}
                <div className="mt-1 space-y-0.5 max-h-12 overflow-y-auto">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-0.5 rounded truncate ${isEventCompleted(event) ? 'bg-gray-100 text-gray-500 line-through' : 'bg-indigo-100 text-indigo-800'}`}
                      title={`${event.functionType} - ${event.startTime} to ${event.endTime} ${isEventCompleted(event) ? '(Completed)' : ''}`}
                    >
                      <div className={`font-medium truncate ${isEventCompleted(event) ? 'line-through' : ''}`}>{event.functionType}</div>
                      <div className={`truncate ${isEventCompleted(event) ? 'line-through' : ''}`}>{event.startTime}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;