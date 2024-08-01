// src/lib/rruleParser.js
export function parseRRule(rrule) {
    const rule = rrule.replace('RRULE:', '').split(';');
    const ruleObj = rule.reduce((acc, curr) => {
      const [key, value] = curr.split('=');
      acc[key] = value;
      return acc;
    }, {});
  
    const frequencyMap = {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
    };
  
    const dayMap = {
      MO: 'Monday',
      TU: 'Tuesday',
      WE: 'Wednesday',
      TH: 'Thursday',
      FR: 'Friday',
      SA: 'Saturday',
      SU: 'Sunday',
    };
  
    let description = `Occurs ${frequencyMap[ruleObj.FREQ] || 'with unspecified frequency'}`;
  
    if (ruleObj.INTERVAL && ruleObj.INTERVAL > 1) {
      description += ` every ${ruleObj.INTERVAL} ${frequencyMap[ruleObj.FREQ] === 'daily' ? 'days' : frequencyMap[ruleObj.FREQ]}`;
    }
  
    if (ruleObj.BYDAY) {
      // Match the pattern for ordinal number and day abbreviation (e.g., "1TH" for "First Thursday")
      const dayParts = ruleObj.BYDAY.match(/(\d)([A-Z]{2})/);
      if (dayParts) {
        const ordinal = dayParts[1];
        const day = dayParts[2];
        const ordinalMap = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  
        description += ` on the ${ordinalMap[ordinal - 1]} ${dayMap[day]}`;
      } else {
        // Handle other BYDAY formats, if any
        const days = ruleObj.BYDAY.split(',').map(day => dayMap[day]).join(', ');
        description += ` on ${days}`;
      }
    } else if (ruleObj.FREQ === 'MONTHLY' && ruleObj.BYMONTHDAY) {
      description += ` on day ${ruleObj.BYMONTHDAY} of the month`;
    }
  
    if (ruleObj.COUNT) {
      description += `, ${ruleObj.COUNT} times`;
    }
  
    if (ruleObj.UNTIL) {
      const untilDate = new Date(ruleObj.UNTIL);
      description += ` until ${untilDate.toDateString()}`;
    }
  
    return description;
  }
  
  