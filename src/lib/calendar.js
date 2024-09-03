import axios from 'axios';
import pkg from 'rrule';
import fs from 'fs';
import path from 'path';
const { RRule } = pkg;

/**
 * Fetches calendar events from the Google Calendar API.
 * 
 * @param {string} calendarIdEnvVar - The calendar ID environment variable.
 * @param {boolean} [includeRecurring=true] - Whether to include recurring events.
 * @returns {Promise<Array>} - A promise that resolves to an array of calendar events.
 */
export async function getCalendarEvents(calendarIdEnvVar, includeRecurring = true) {
  const API_KEY = import.meta.env.PUBLIC_API_KEY;
  const CALENDAR_ID = calendarIdEnvVar;
  const now = new Date();
  const tonight = new Date();
  tonight.setHours(0, 0, 0, 0);
  const fourMonthsLater = new Date(now);
  fourMonthsLater.setMonth(now.getMonth() + 4);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${tonight.toISOString()}`
    );

    const events = response.data.items
      .filter(event => event.status === 'confirmed')
      .flatMap(event => processEvent(event, tonight, fourMonthsLater, includeRecurring))
      .filter(event => isUpcomingEvent(event, tonight))
      .sort(sortByStartDate);

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Processes a calendar event and generates its occurrences.
 * 
 * @param {Object} event - The calendar event object.
 * @param {Date} tonight - The start of today.
 * @param {Date} fourMonthsLater - The date four months from now.
 * @param {boolean} includeRecurring - Whether to include recurring events.
 * @returns {Array} - An array of processed event occurrences.
 */
function processEvent(event, tonight, fourMonthsLater, includeRecurring) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  const eventEnd = new Date(event.end.dateTime || event.end.date);
  const thirtyDaysLater = new Date(tonight);
  thirtyDaysLater.setDate(tonight.getDate() + 30);

  let occurrences = [];

  if (event.recurrence) {
    if (includeRecurring) {
      const nextOccurrences = getNextOccurrences(event, tonight, fourMonthsLater);
      occurrences = nextOccurrences.map(nextOccurrence => {
        const duration = eventEnd - eventStart;
        return {
          ...event,
          start: { dateTime: nextOccurrence.toISOString() },
          end: { dateTime: new Date(nextOccurrence.getTime() + duration).toISOString() },
          humanRecurrence: getHumanReadableRecurrence(event.recurrence)
        };
      });
    } else {
      const nextOccurrences = getNextOccurrences(event, tonight, thirtyDaysLater);
      occurrences = nextOccurrences.map(nextOccurrence => {
        const duration = eventEnd - eventStart;
        return {
          ...event,
          start: { dateTime: nextOccurrence.toISOString() },
          end: { dateTime: new Date(nextOccurrence.getTime() + duration).toISOString() },
          humanRecurrence: getHumanReadableRecurrence(event.recurrence)
        };
      });
    }
  }

  if (!event.recurrence || !isDuplicate(event, occurrences)) {
    occurrences.push({
      ...event,
      start: { dateTime: eventStart.toISOString() },
      end: { dateTime: eventEnd.toISOString() },
      humanRecurrence: event.recurrence ? getHumanReadableRecurrence(event.recurrence) : null,
      attachments: await processAttachments(event.attachments), // Await the promise here
      description: targetBlank(event.description),
    });
  }

  return occurrences;
}

/**
 * Adds target="_blank" to all <a> tags in the description.
 * 
 * @param {string} description - The event description.
 * @returns {string} - The modified description with target="_blank" added.
 */
function targetBlank(description) {
  if (!description) return description;
  return description.replace(/<a /g, '<a target="_blank" ');
}

/**
 * Processes event attachments and downloads them.
 * 
 * @param {Array} attachments - The array of attachment objects.
 * @returns {Promise<Array>} - A promise that resolves to an array of processed attachments.
 */
async function processAttachments(attachments) {
  if (!attachments) return null;

  const processedAttachments = await Promise.all(attachments.map(async attachment => {
    const fileUrl = `https://drive.google.com/uc?export=view&id=${attachment.fileId}`;
    const fileName = attachment.title;
    const localPath = path.join(process.cwd(), 'public', 'event-images', fileName);

    // Check if the file already exists
    if (fs.existsSync(localPath)) {
      console.log(`File ${fileName} already exists. Skipping download.`);
      return {
        ...attachment,
        localPath: `/event-images/${fileName}`,
      };
    }

    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      if (response.data) {
        fs.writeFileSync(localPath, response.data);
        return {
          ...attachment,
          localPath: `/event-images/${fileName}`,
        };
      } else {
        console.error(`Error downloading attachment ${fileName}: No data received`);
        return null;
      }
    } catch (error) {
      console.error(`Error downloading attachment ${fileName}:`, error);
      return null;
    }
  }));

  return processedAttachments.filter(attachment => attachment !== null);
}

/**
 * Gets the next occurrences of a recurring event within a date range.
 * 
 * @param {Object} event - The calendar event object.
 * @param {Date} fromDate - The start date for the occurrences.
 * @param {Date} toDate - The end date for the occurrences.
 * @returns {Array} - An array of occurrence dates.
 */
function getNextOccurrences(event, fromDate, toDate) {
  if (!event.recurrence) return [];

  let occurrences = [];
  const originalStart = new Date(event.start.dateTime || event.start.date);

  for (const rruleString of event.recurrence) {
    const rule = RRule.fromString(rruleString.replace('RRULE:', ''));
    const nextDates = rule.between(fromDate, toDate, true).filter(date => date >= fromDate);

    occurrences = occurrences.concat(
      nextDates
        .filter(date => date >= originalStart)
        .map(date => {
          const occurrence = new Date(date);
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

/**
 * Checks if an event is upcoming based on the current date.
 * 
 * @param {Object} event - The calendar event object.
 * @param {Date} tonight - The start of today.
 * @returns {boolean} - True if the event is upcoming, false otherwise.
 */
function isUpcomingEvent(event, tonight) {
  const eventStart = new Date(event.start.dateTime || event.start.date);
  return eventStart >= tonight;
}

/**
 * Sorts events by their start date.
 * 
 * @param {Object} a - The first event to compare.
 * @param {Object} b - The second event to compare.
 * @returns {number} - A negative number if a < b, a positive number if a > b, or 0 if they are equal.
 */
function sortByStartDate(a, b) {
  const dateA = new Date(a.start.dateTime || a.start.date);
  const dateB = new Date(b.start.dateTime || b.start.date);
  return dateA - dateB;
}

/**
 * Converts a recurrence rule into a human-readable format.
 * 
 * @param {Array} recurrence - The recurrence rules.
 * @returns {string|null} - A human-readable string or null if no rules are provided.
 */
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

/**
 * Checks if an event is a duplicate of any occurrences.
 * 
 * @param {Object} event - The calendar event object.
 * @param {Array} occurrences - The array of occurrences to check against.
 * @returns {boolean} - True if the event is a duplicate, false otherwise.
 */
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
