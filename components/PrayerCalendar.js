'use client';

import { useEffect, useMemo, useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { PRAYERS, calculateStats, formatDateKey, parseDateKey, readPrayerData, writePrayerData } from '@/lib/prayers';

function getSummary(dayRecord = {}) {
  const statuses = PRAYERS.map((prayer) => dayRecord[prayer.key] || 'missed');
  const hasData = PRAYERS.some((prayer) => dayRecord[prayer.key]);

  if (!hasData) return { label: 'No Data', className: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60' };
  if (statuses.every((status) => status === 'done')) return { label: 'Done', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30' };
  if (statuses.some((status) => status === 'qaza')) return { label: 'Qaza', className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30' };
  return { label: 'Missing', className: 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30' };
}

export default function PrayerCalendar() {
  const [records, setRecords] = useState({});
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));

  useEffect(() => {
    setRecords(readPrayerData());
  }, []);

  const selectedRecord = records[selectedDate] || {};
  const stats = useMemo(() => calculateStats(records, visibleMonth), [records, visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedLabel = parseDateKey(selectedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  function updatePrayer(prayerKey, status) {
    const nextRecords = { ...records, [selectedDate]: { ...(records[selectedDate] || {}) } };

    if (status === 'missed') {
      delete nextRecords[selectedDate][prayerKey];
    } else {
      nextRecords[selectedDate][prayerKey] = status;
    }

    if (Object.keys(nextRecords[selectedDate]).length === 0) {
      delete nextRecords[selectedDate];
    }

    setRecords(nextRecords);
    writePrayerData(nextRecords);
  }

  function shiftMonth(offset) {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
  }

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const todayKey = formatDateKey(new Date());

    return [
      ...Array.from({ length: firstDayIndex }, (_, index) => ({ type: 'spacer', key: `spacer-${index}` })),
      ...Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        const dateKey = formatDateKey(new Date(year, month, day));
        const summary = getSummary(records[dateKey]);

        return {
          type: 'day',
          day,
          dateKey,
          label: summary.label,
          className: summary.className,
          isSelected: dateKey === selectedDate,
          isToday: dateKey === todayKey,
        };
      }),
    ];
  }, [records, selectedDate, visibleMonth]);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-600"><AppIcon name="calendar" className="h-4 w-4" />Monthly Calendar</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{monthLabel}</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
              Prev
            </button>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((item) => item.type === 'spacer' ? (
            <div key={item.key} />
          ) : (
            <button
              key={item.dateKey}
              type="button"
              onClick={() => setSelectedDate(item.dateKey)}
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl border p-2 transition ${item.className} ${item.isSelected ? 'ring-2 ring-emerald-500' : ''} ${item.isToday ? 'outline outline-2 outline-offset-2 outline-emerald-400' : ''}`}
            >
              <span className="text-base font-bold">{item.day}</span>
              <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Selected Day</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedLabel}</h2>

          <div className="mt-6 space-y-3">
            {PRAYERS.map((prayer) => {
              const status = selectedRecord[prayer.key] || 'missed';

              return (
                <div key={prayer.key} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-3 text-lg font-semibold">
                      <AppIcon name={prayer.key} className="h-5 w-5 text-emerald-600" />
                      <input
                        type="checkbox"
                        checked={status === 'done'}
                        onChange={(event) => updatePrayer(prayer.key, event.target.checked ? 'done' : 'missed')}
                        className="h-5 w-5 accent-emerald-500"
                      />
                      {prayer.label}
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-300">
                      <input
                        type="checkbox"
                        checked={status === 'qaza'}
                        onChange={(event) => updatePrayer(prayer.key, event.target.checked ? 'qaza' : 'missed')}
                        className="h-4 w-4 accent-amber-500"
                      />
                      Qaza
                    </label>
                  </div>
                  <p className={`mt-2 text-sm ${status === 'done' ? 'text-emerald-600' : status === 'qaza' ? 'text-amber-600' : 'text-red-500'}`}>
                    {status === 'done' ? 'Completed' : status === 'qaza' ? 'Marked as Qaza' : 'Missing'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Progress</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-slate-800">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><AppIcon name="check" className="h-4 w-4 text-emerald-600" />Total prayers done</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.done}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4 dark:bg-slate-800">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><AppIcon name="qaza" className="h-4 w-4 text-red-500" />Total qaza</p>
              <p className="text-3xl font-bold text-red-500">{stats.qaza}</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-300">Monthly progress</span>
                <span className="font-semibold">{stats.monthProgress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.monthProgress}%` }} />
              </div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}




