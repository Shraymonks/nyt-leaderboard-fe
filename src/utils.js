export function getLatestPuzzleDate() {
  const date = new Date();
  const day = date.getUTCDay();
  const hours = date.getUTCHours();
  const isWeekend =
    day === 6 && hours === 23 ||
    day === 0 ||
    day === 1 && hours < 23;

  const weekdayUTCHourOffset = -3; // Releases 3am UTC
  const weekendUTCHourOffset = 1; // Releases 11pm UTC

  const hourOffset = isWeekend ? weekendUTCHourOffset : weekdayUTCHourOffset;

  const latestDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours() + hourOffset
  );

  return latestDate.toISOString().substring(0, 10);
}

export function getOffsetDate(dateString, offset) {
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + offset);

  return date.toISOString().substring(0, 10);
}

export function secondsToMinutes(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function toReadableDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
  });
}
