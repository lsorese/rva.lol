// lib/calendar.js
import axios from 'axios';
import pkg from 'rrule';
const { RRule } = pkg;

export async function getCalendarEvents(calendarIdEnvVar) {
  const API_KEY = import.meta.env.PUBLIC_API_KEY;
  const CALENDAR_ID = import.meta.env[calendarIdEnvVar];
  console.log(CALENDAR_ID, "CALENDAR ID")
  console.log(import.meta.env.PUBLIC_API_KEY, "API KEY")
  console.log(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`, "URL")

  const response = await axios.get(
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
  );

  console.log(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`, "URL")


  // Current date and time
  const now = new Date();

  // Filter, sort, and include future occurrences of past recurring events
  const events = response.data.items
    .filter(event => event.status === 'confirmed')
    .map(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);

      if (eventEnd < now && event.recurrence) {
        // Handle recurring event in the past
        const nextOccurrence = getNextOccurrence(event, now);
        if (nextOccurrence) {
          // Update event times to next occurrence
          event.start.dateTime = nextOccurrence.toISOString();
          event.end.dateTime = new Date(nextOccurrence.getTime() + (eventEnd - eventStart)).toISOString();
        }
      }

      return event;
    })
    .filter(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      return eventStart >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.start.dateTime || a.start.date);
      const dateB = new Date(b.start.dateTime || b.start.date);
      return dateA - dateB;
    });

  return events;
}

function getNextOccurrence(event, fromDate) {
  // Use rrule library to calculate next occurrence
  if (!event.recurrence) return null;

  for (const rruleString of event.recurrence) {
    const rule = RRule.fromString(rruleString.replace('RRULE:', ''));
    const nextDate = rule.after(fromDate, true); // true means inclusive of fromDate
    if (nextDate) {
      return nextDate;
    }
  }
  return null;
}