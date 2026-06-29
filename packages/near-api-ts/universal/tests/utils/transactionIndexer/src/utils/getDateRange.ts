// Returns every date from `start` to `end` (both inclusive) as 'YYYY-MM-DD'
// strings. Works in UTC so it's immune to local timezone / DST shifts.
export const getDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];

  for (
    let day = new Date(`${start}T00:00:00Z`);
    day <= new Date(`${end}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    dates.push(day.toISOString().slice(0, 10));
  }

  return dates;
};
