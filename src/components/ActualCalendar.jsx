import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
const localizer = momentLocalizer(moment);

const transformEvents = (events) => {
  return events.map(event => ({
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime, // Assume allDay if only date is provided
    resource: event, // Include the original event object if needed
  }));
};

const Flyout = ({ event, onClose }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.className.includes('flyout-overlay')) {
      onClose();
    }
  };

  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll when flyout is open
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [event]);

  return (
    <>
      <div
        className={`flyout-overlay ${event ? 'flyout-overlay-show' : ''}`}
        onClick={handleBackgroundClick}
      />
      <div className={`flyout ${event ? 'flyout-show' : ''}`}>
        <div className="flyout-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>{event?.title}</h2>
          {/* Additional event details can go here */}
        </div>
      </div>
    </>
  );
};

const ActualCalendar = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const transformedEvents = transformEvents(events);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    console.log(event);
  };

  const handleCloseFlyout = () => {
    setSelectedEvent(null);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={transformedEvents}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        onSelectEvent={handleEventClick}
      />
      <Flyout event={selectedEvent} onClose={handleCloseFlyout} />
    </div>
  );
};

export default ActualCalendar;