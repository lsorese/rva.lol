// lib/calendar.js
import axios from 'axios';

const API_KEY = import.meta.env.PUBLIC_API_KEY;
const CALENDAR_ID = import.meta.env.PUBLIC_CALENDAR_ID;

export async function getCalendarEvents() {
  const response = await axios.get(
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
  );

  // Filter and sort events
  const events = response.data.items
    .filter(event => event.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.start.dateTime || a.start.date);
      const dateB = new Date(b.start.dateTime || b.start.date);
      return dateA - dateB;
    });

  return events;
}
