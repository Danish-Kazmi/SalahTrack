export const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

export const STORAGE_KEY = 'prayer-tracker-data';
export const THEME_KEY = 'prayer-tracker-theme';

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function readPrayerData() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function writePrayerData(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function calculateStats(data, visibleMonth) {
  let done = 0;
  let qaza = 0;
  let monthDone = 0;
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  Object.entries(data).forEach(([dateKey, dayRecord]) => {
    Object.values(dayRecord).forEach((status) => {
      if (status === 'done') done += 1;
      if (status === 'qaza') qaza += 1;
    });

    const recordDate = parseDateKey(dateKey);
    if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
      Object.values(dayRecord).forEach((status) => {
        if (status === 'done') monthDone += 1;
      });
    }
  });

  return {
    done,
    qaza,
    monthProgress: Math.round((monthDone / (daysInMonth * PRAYERS.length)) * 100),
  };
}
