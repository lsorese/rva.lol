import axios from 'axios';
import pkg from 'rrule';
const { RRule } = pkg;

export async function getCalendarEvents(calendarIdEnvVar) {
  const API_KEY = import.meta.env.PUBLIC_API_KEY;
  const CALENDAR_ID = calendarIdEnvVar;
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(now.getMonth() + 1);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
    );

    const events = response.data.items
      .filter(event => event.status === 'confirmed')
      .flatMap(event => processEvent(event, now, oneMonthLater))
      .filter(event => isUpcomingEvent(event, now))
      .sort(sortByStartDate);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

function processEvent(event, now, oneMonthLater) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  const eventEnd = new Date(event.end.dateTime || event.end.date);

  let occurrences = [];

  // If the event is recurring
  if (event.recurrence) {
    const nextOccurrences = getNextOccurrences(event, eventStart, oneMonthLater);
    occurrences = nextOccurrences.map(nextOccurrence => {
      const duration = eventEnd - eventStart;
      return {
        ...event,
        start: { dateTime: nextOccurrence.toISOString() },
        end: { dateTime: new Date(nextOccurrence.getTime() + duration).toISOString() }
      };
    });
  }

  // Include the original event if it's not a duplicate
  if (!event.recurrence || !isDuplicate(event, occurrences)) {
    occurrences.push(event);
  }

  return occurrences;
}

function isUpcomingEvent(event, now) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  return eventStart >= now;
}

function sortByStartDate(a, b) {
  const dateA = new Date(a.start.dateTime || a.start.date);
  const dateB = new Date(b.start.dateTime || b.start.date);
  return dateA - dateB;
}

function getNextOccurrences(event, fromDate, toDate) {
  if (!event.recurrence) return [];

  let occurrences = [];
  for (const rruleString of event.recurrence) {
    const rule = RRule.fromString(rruleString.replace('RRULE:', ''));
    // Ensure occurrences start from the original event date, not before
    const nextDates = rule.between(fromDate, toDate, true).filter(date => date >= fromDate);
    occurrences = occurrences.concat(nextDates);
  }

  return occurrences;
}

function isDuplicate(event, occurrences) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  return occurrences.some(occurrence => {
    const occurrenceStart = new Date(occurrence.start.dateTime || occurrence.start.date);
    return eventStart.getTime() === occurrenceStart.getTime();
  });
}