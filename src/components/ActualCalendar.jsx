import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, generateGoogleMapsLink } from '../utils';

const localizer = momentLocalizer(moment);

const transformEvents = (events) => {
  return events.map(event => ({
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime,
    resource: event,
  }));
};

const Flyout = ({ event, onClose }) => {
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('flyout-overlay')) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = event ? 'hidden' : 'unset';

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [event, onClose]);

  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
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
          <h2>
            {event?.resource?.summary}<br />
            {event?.resource?.humanRecurrence && (
              <small>{capitalizeFirstLetter(event?.resource?.humanRecurrence)}</small>
            )}
          </h2>
          <h3>{formatDate(event?.resource?.start.dateTime || event?.resource?.start.date)}</h3>
          {event?.resource?.attachments && event.resource.attachments.length > 0 && (
              <details>
                <summary><strong>Event Poster</strong></summary>
                {event.resource.attachments.map((attachment, index) => (
                  <img 
                    key={index}
                    src={`/event-images/${attachment.title}`}
                    alt={attachment.title}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ))}
              </details>
            )}
          <p>
            <strong>Info:</strong><br />
            <span dangerouslySetInnerHTML={{ __html: decodeHtml(event?.resource?.description || '') }}></span>
          </p>
          {event?.resource?.location && (
            <p>
              <strong>Location:</strong><br />
              {event?.resource?.location}<br />
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
        showAllEvents
        views={["month"]}
        onSelectEvent={handleEventClick}
      />
      <Flyout event={selectedEvent} onClose={handleCloseFlyout} />
    </div>
  );
};

export default ActualCalendar;