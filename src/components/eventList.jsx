import React from 'react';
import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, formatRecurrence, generateGoogleMapsLink } from '../utils';

const EventList = ({ events }) => {
  return (
    <>
      <h1>Open Mics:</h1>
      <a
        data-add
        href="https://calendar.google.com/calendar/ical/b3d8d5b621d0840f0266cfbcfaaaeb06986e135975d1bc7d73eb74d5edfeaa9f%40group.calendar.google.com/public/basic.ics"
        target="_blank"
        rel="noopener noreferrer"
      >
        Add these events to your calendar →
      </a>
      {events.map((event) => {
        const eventStart = event.start.dateTime || event.start.date;
        return (
          <div 
            data-event
            key={event.id} 
            className={isToday(eventStart) ? 'today-event' : ''}
          >
            {isToday(eventStart) && <div className="today">TODAY!</div>}
            <h2>{event.summary}<br />{event.recurrence && (
              <small>{capitalizeFirstLetter(event.recurrence.map(rrule => formatRecurrence(rrule)).join(', '))}
              </small>
            )}</h2>
            <h3>{formatDate(eventStart)}</h3>
            
            <p><strong>Info:</strong><br /><span dangerouslySetInnerHTML={{ __html: decodeHtml(event.description || '') }}></span></p>

            {event.location && (
              <p>
                <strong>Location:</strong><br /> {event.location}<br />
                <a href={generateGoogleMapsLink(event.location)} target="_blank" rel="noopener noreferrer">(View on Google Maps) →</a>
              </p>
            )}
          </div>
        );
      })}
    </>
  );
};

export default EventList;