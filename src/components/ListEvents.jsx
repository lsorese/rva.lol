import { formatDate, isToday, decodeHtml, capitalizeFirstLetter, generateGoogleMapsLink, getDaysUntilEvent } from '../utils';

const EventList = ({ events }) => {
  return (
    <>
      {events.map((event) => {
        const eventStart = event.start.dateTime || event.start.date;
        const daysUntilEvent = getDaysUntilEvent(eventStart);
        return (
          <div 
            data-event
            key={event.id} 
            className={isToday(eventStart) ? 'today-event' : ''}
          >
            {isToday(eventStart) && <div className="today">SOON!</div>}
            <h6>${daysUntilEvent}</h6>
            <h2>{event.summary}<br />{event.recurrence && (
              <small>{capitalizeFirstLetter(event.humanRecurrence)}
              </small>
            )}</h2>
            <h3>{formatDate(eventStart)}</h3>
            {event.attachments && event.attachments.length > 0 && (
              <details>
                <summary><strong>Event Poster</strong></summary>
                {event.attachments.map((attachment, index) => (
                  <img 
                    key={index}
                    src={`/event-images/${attachment.title}`}
                    alt={attachment.title}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ))}
              </details>
            )}
            
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