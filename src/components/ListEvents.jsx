import React from 'react';
import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, generateGoogleMapsLink } from '../utils';

const EventList = ({ events }) => {
  return (
    <>
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
              <small>{capitalizeFirstLetter(event.humanRecurrence)}
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