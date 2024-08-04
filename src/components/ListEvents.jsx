import React from 'react';
import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, generateGoogleMapsLink } from '../utils';

const EventList = ({ events }) => {
  const renderEvent = (event) => {
    const eventStart = event.start.dateTime || event.start.date;
    const isTodayEvent = isToday(eventStart);

    return (
      <div 
        key={event.id} 
        className={isTodayEvent ? 'today-event' : ''}
      >
        {isTodayEvent && <div className="today">TODAY!</div>}
        <h2>{event.summary}<br />{event.recurrence && (
          <small>{capitalizeFirstLetter(event.humanRecurrence)}</small>
        )}</h2>
        <h3>{formatDate(eventStart)}</h3>
        
        <p>
          <strong>Info:</strong><br />
          <span dangerouslySetInnerHTML={{ __html: decodeHtml(event.description || '') }}></span>
        </p>

        {event.location && (
          <p>
            <strong>Location:</strong><br /> 
            {event.location}<br />
            <a href={generateGoogleMapsLink(event.location)} target="_blank" rel="noopener noreferrer">(View on Google Maps) →</a>
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {events.map(renderEvent)}
    </>
  );
};

export default EventList;