import axios from 'axios';
import pkg from 'rrule';
const {RRule} = pkg;

export async function getCalendarEvents(calendarIdEnvVar, includeRecurring = true) {
  const API_KEY = import.meta.env.PUBLIC_API_KEY;
  const CALENDAR_ID = calendarIdEnvVar;
  const now = new Date();
  const fourMonthsLater = new Date(now);
  fourMonthsLater.setMonth(now.getMonth() + 4);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
    );

    const events = response.data.items
      .filter(event => event.status === 'confirmed')
      .flatMap(event => processEvent(event, now, fourMonthsLater, includeRecurring))
      .filter(event => isUpcomingEvent(event, now))
      .sort(sortByStartDate);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

function processEvent(event, now, fourMonthsLater, includeRecurring) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  const eventEnd = new Date(event.end.dateTime || event.end.date);

  let occurrences = [];

  if (includeRecurring && event.recurrence) {
    const nextOccurrences = getNextOccurrences(event, eventStart, fourMonthsLater);
    occurrences = nextOccurrences.map(nextOccurrence => {
      const duration = eventEnd - eventStart;
      return {
        ...event,
        start: { dateTime: nextOccurrence.toISOString() },
        end: { dateTime: new Date(nextOccurrence.getTime() + duration).toISOString() },
        humanRecurrence: getHumanReadableRecurrence(event.recurrence),
      };
    });
  }

  if (!event.recurrence || !isDuplicate(event, occurrences)) {
    occurrences.push({
      ...event,
      humanRecurrence: event.recurrence ? getHumanReadableRecurrence(event.recurrence) : null,
    });
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
    const nextDates = rule.between(fromDate, toDate, true).filter(date => date >= fromDate);
    occurrences = occurrences.concat(nextDates);
  }

  return occurrences;
}

function getHumanReadableRecurrence(recurrence) {
  if (!recurrence || recurrence.length === 0) return null;
  try {
    const rule = RRule.fromString(recurrence[0].replace('RRULE:', ''));
    return rule.toText();
  } catch (error) {
    console.error('Error parsing RRULE:', error);
    return null;
  }
}

function isDuplicate(event, occurrences) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  const eventTitle = event.summary;
  
  return occurrences.some(occurrence => {
    const occurrenceStart = new Date(occurrence.start.dateTime || occurrence.start.date);
    const occurrenceTitle = occurrence.summary;

    return (
      eventTitle === occurrenceTitle &&
      eventStart.toDateString() === occurrenceStart.toDateString()
    );
  });
}
