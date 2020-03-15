import {format, toDate, utcToZonedTime} from 'date-fns-tz';

function formatDate(date) {
  return format(date, 'yyyy-MM-dd');
}

export function getLatestPuzzleDate() {
  const date = utcToZonedTime(new Date(), 'America/Los_Angeles');
  const day = date.getDay();
  const hours = date.getHours();
  const isWeekend =
    day === 6 && hours >= 15 ||
    day === 0 ||
    day === 1 && hours < 15;

  const weekdayHourOffset = 5; // Releases 7pm PT
  const weekendHourOffset = 9; // Releases 3pm PT
  const hourOffset = isWeekend ? weekendHourOffset : weekdayHourOffset;
  date.setHours(date.getHours() + hourOffset);

  return formatDate(date);
}

export function getOffsetDate(dateString, offset) {
  const date = toDate(dateString);
  date.setDate(date.getDate() + offset);

  return formatDate(date);
}

export function secondsToMinutes(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toReadableDate(dateString) {
  return format(toDate(dateString), 'EEEE, MMMM d, yyyy');
}
