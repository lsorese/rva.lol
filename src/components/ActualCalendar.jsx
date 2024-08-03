import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, generateGoogleMapsLink } from '../utils';

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
          <h2>{event?.resource?.summary}<br />{event?.resource?.humanRecurrence && (
            <small>{capitalizeFirstLetter(event?.resource?.humanRecurrence)}
            </small>
          )}</h2>
          <h3>{formatDate(event?.resource?.start.dateTime || event?.resource?.start.date)}</h3>
          <p><strong>Info:</strong><br /><span dangerouslySetInnerHTML={{ __html: decodeHtml(event?.resource?.description || '') }}></span></p>
          {event?.resource?.location && (
            <p>
              <strong>Location:</strong><br /> {event?.resource?.location}<br />
              <a href={generateGoogleMapsLink(event?.resource?.location)} target="_blank" rel="noopener noreferrer">(View on Google Maps) →</a>
            </p>
          )}
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