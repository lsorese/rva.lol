import React, { useState } from 'react';
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

const Modal = ({ event, onClose }) => {
  return (
    <div className={`modal ${event ? 'modal-show' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{event?.title}</h2>
        </div>
    </div>
  );
};

const ActualCalendar = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const transformedEvents = transformEvents(events);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    console.log(event)
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={transformedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={["month", 'week']}
        onSelectEvent={handleEventClick}
      />
      <Modal event={selectedEvent} onClose={handleCloseModal} />
    </div>
  );
};

export default ActualCalendar;