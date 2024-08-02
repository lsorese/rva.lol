// lib/calendar.js
import axios from 'axios';
import pkg from 'rrule';
const { RRule } = pkg;

export async function getCalendarEvents(calendarIdEnvVar) {
  const API_KEY = import.meta.env.PUBLIC_API_KEY;
  const CALENDAR_ID = calendarIdEnvVar;
  const now = new Date();

  try {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
    );

    const events = response.data.items
      .filter(event => event.status === 'confirmed')
      .map(event => processEvent(event, now))
      .filter(event => isUpcomingEvent(event, now))
      .sort(sortByStartDate);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

function processEvent(event, now) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  const eventEnd = new Date(event.end.dateTime || event.end.date);

  if (eventEnd < now && event.recurrence) {
    const nextOccurrence = getNextOccurrence(event, now);
    if (nextOccurrence) {
      const duration = eventEnd - eventStart;
      event.start.dateTime = nextOccurrence.toISOString();
      event.end.dateTime = new Date(nextOccurrence.getTime() + duration).toISOString();
    }
  }

  return event;
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

function getNextOccurrence(event, fromDate) {
  if (!event.recurrence) return null;

  for (const rruleString of event.recurrence) {
    const rule = RRule.fromString(rruleString.replace('RRULE:', ''));
    const nextDate = rule.after(fromDate, true);
    if (nextDate) {
      return nextDate;
    }
  }

  return null;
}