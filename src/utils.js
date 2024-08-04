import he from 'he';

// Date-related utilities
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function isToday(dateString) {
  const eventDate = new Date(dateString);
  const today = new Date();
  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  );
}

// String-related utilities
export function decodeHtml(html) {
  return he.decode(html);
}

export function capitalizeFirstLetter(string) {
  if (!string) return ''; // Handle empty or undefined string
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Location-related utilities
export function generateGoogleMapsLink(location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function getCalendar(option) {
  const calendars = {
    openmics: 'b3d8d5b621d0840f0266cfbcfaaaeb06986e135975d1bc7d73eb74d5edfeaa9f@group.calendar.google.com',
    showcases: '7c54a7efcbad1512c0061bacfc4635726f1893ed9db7456b4b1b05c8b9c26561@group.calendar.google.com',
  };

  if (option in calendars) {
    return calendars[option];
  } else {
    throw new Error('Invalid option');
  }
}
