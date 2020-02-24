export function getLatestPuzzleDate() {
  const date = new Date();
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  const latestDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours() + (isWeekend ? 9 : 5),
  ));

  return latestDate.toISOString().substring(0, 10);
}

export function getOffsetDate(dateString, offset) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + offset);

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
