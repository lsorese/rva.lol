import axios from 'axios';
import pkg from 'rrule';
const { RRule } = pkg;

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
  const eventStart = shiftDateByOneDay(new Date(event.start.dateTime || event.start.date));
  const eventEnd = shiftDateByOneDay(new Date(event.end.dateTime || event.end.date));
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(now.getDate() + 30);

  let occurrences = [];

  if (event.recurrence) {
    if (includeRecurring) {
      // Include all future occurrences within the time range
      const nextOccurrences = getNextOccurrences(event, now, fourMonthsLater);
      occurrences = nextOccurrences.map(nextOccurrence => {
        const duration = eventEnd - eventStart;
        const shiftedStart = shiftDateByOneDay(nextOccurrence);
        return {
          ...event,
          start: { dateTime: shiftedStart.toISOString() },
          end: { dateTime: new Date(shiftedStart.getTime() + duration).toISOString() },
          humanRecurrence: getHumanReadableRecurrence(event.recurrence),
        };
      });
    } else {
      // Include all occurrences within the next 30 days
      const nextOccurrences = getNextOccurrences(event, now, thirtyDaysLater);
      occurrences = nextOccurrences.map(nextOccurrence => {
        const duration = eventEnd - eventStart;
        const shiftedStart = shiftDateByOneDay(nextOccurrence);
        return {
          ...event,
          start: { dateTime: shiftedStart.toISOString() },
          end: { dateTime: new Date(shiftedStart.getTime() + duration).toISOString() },
          humanRecurrence: getHumanReadableRecurrence(event.recurrence),
        };
      });
    }
  }

  // Include the original event if it's not a duplicate
  if (!event.recurrence || !isDuplicate(event, occurrences)) {
    occurrences.push({
      ...event,
      start: { dateTime: eventStart.toISOString() },
      end: { dateTime: eventEnd.toISOString() },
      humanRecurrence: event.recurrence ? getHumanReadableRecurrence(event.recurrence) : null,
    });
  }

  return occurrences;
}

function shiftDateByOneDay(date) {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + 1);  // Shift the date by one day
  return shiftedDate;
}

function getNextOccurrences(event, fromDate, toDate) {
  if (!event.recurrence) return [];

  let occurrences = [];
  const originalStart = shiftDateByOneDay(new Date(event.start.dateTime || event.start.date));

  for (const rruleString of event.recurrence) {
    const rule = RRule.fromString(rruleString.replace('RRULE:', ''));

    // Generate recurrence dates between fromDate and toDate
    const nextDates = rule.between(fromDate, toDate, true).filter(date => date >= fromDate);

    occurrences = occurrences.concat(
      nextDates
        .filter(date => date >= originalStart)  // Ensure no occurrence is before the original event's start date
        .map(date => {
          const occurrence = new Date(date);

          // Set the time of day to match the original event's start time
          occurrence.setHours(
            originalStart.getHours(),
            originalStart.getMinutes(),
            originalStart.getSeconds(),
            originalStart.getMilliseconds()
          );

          return occurrence;
        })
    );
  }

  return occurrences;
}

function isUpcomingEvent(event, now) {
  const eventStart = shiftDateByOneDay(new Date(event.start.dateTime || event.start.date));
  return eventStart >= now;
}

function sortByStartDate(a, b) {
  const dateA = shiftDateByOneDay(new Date(a.start.dateTime || a.start.date));
  const dateB = shiftDateByOneDay(new Date(b.start.dateTime || b.start.date));
  return dateA - dateB;
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
  const eventStart = shiftDateByOneDay(new Date(event.start.dateTime || event.start.date));
  const eventTitle = event.summary;

  return occurrences.some(occurrence => {
    const occurrenceStart = shiftDateByOneDay(new Date(occurrence.start.dateTime || occurrence.start.date));
    const occurrenceTitle = occurrence.summary;

    return (
      eventTitle === occurrenceTitle &&
      eventStart.toDateString() === occurrenceStart.toDateString()
    );
  });
}
