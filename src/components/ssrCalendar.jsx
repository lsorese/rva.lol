import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const transformEvents = (events) => {
  return events.map(event => ({
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime, // Assume allDay if only date is provided
    resource: event // Include the original event object if needed
  }));
};

const ActualCalendar = ({ events }) => {
  const transformedEvents = transformEvents(events);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={transformedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default ActualCalendar;