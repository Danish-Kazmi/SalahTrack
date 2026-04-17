'use client';

import { useEffect, useMemo, useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { getCurrentUser } from '@/lib/auth';
import { fetchPrayerData, migrateLegacyPrayerDataToSupabase, savePrayerDay } from '@/lib/prayerRecords';
import { PRAYERS, calculateStats, formatDateKey, parseDateKey } from '@/lib/prayers';

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
  const [currentUserId, setCurrentUserId] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [syncMessage, setSyncMessage] = useState('Synced');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        const userId = user?.id || '';
        setCurrentUserId(userId);

        if (!userId) {
          setRecords({});
          setIsLoading(false);
          return;
        }

        const existingRecords = await fetchPrayerData(userId);

        if (Object.keys(existingRecords).length > 0) {
          setRecords(existingRecords);
          setErrorMessage('');
          return;
        }

        const migratedRecords = await migrateLegacyPrayerDataToSupabase(userId);
        setRecords(migratedRecords);
        setErrorMessage('');
      } catch {
        if (!isMounted) return;

        setCurrentUserId('');
        setRecords({});
        setErrorMessage('Unable to load your prayer history right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      isMounted = false;
    };
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

  async function updatePrayer(prayerKey, status) {
    if (isSaving) return;
    if (selectedDate > formatDateKey(new Date())) return;

    const nextRecords = { ...records, [selectedDate]: { ...(records[selectedDate] || {}) } };

    if (status === 'missed') {
      delete nextRecords[selectedDate][prayerKey];
    } else {
      nextRecords[selectedDate][prayerKey] = status;
    }

    if (Object.keys(nextRecords[selectedDate]).length === 0) {
      delete nextRecords[selectedDate];
    }

    const nextSelectedRecord = nextRecords[selectedDate] || {};

    setRecords(nextRecords);
    setIsSaving(true);
    setSyncMessage('Saving...');

    try {
      await savePrayerDay(currentUserId, selectedDate, nextSelectedRecord);
      setErrorMessage('');
      setSyncMessage('Synced');
    } catch {
      setRecords(records);
      setErrorMessage('We could not save that change. Please try again.');
      setSyncMessage('Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  function shiftMonth(offset) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);

    const today = new Date();
    const isSameMonth = nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() === today.getMonth();
    setSelectedDate(formatDateKey(isSameMonth ? today : nextMonth));
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today));
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
        const isFuture = dateKey > todayKey;
        const summary = isFuture
          ? { label: 'Upcoming', className: 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500' }
          : getSummary(records[dateKey]);

        return {
          type: 'day',
          day,
          dateKey,
          label: summary.label,
          className: summary.className,
          isSelected: dateKey === selectedDate,
          isToday: dateKey === todayKey,
          isFuture,
        };
      }),
    ];
  }, [records, selectedDate, visibleMonth]);

  const isFutureSelected = selectedDate > formatDateKey(new Date());

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-10">
        <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Preparing Data</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Loading your prayer history...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-600"><AppIcon name="calendar" className="h-4 w-4" />Monthly Calendar</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{monthLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className={`text-sm font-medium ${errorMessage ? 'text-red-600 dark:text-red-300' : syncMessage === 'Saving...' ? 'text-amber-600 dark:text-amber-300' : 'text-slate-500 dark:text-slate-300'}`}>
              {errorMessage || syncMessage}
            </p>
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
              Prev
            </button>
            <button type="button" onClick={goToToday} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300">
              Today
            </button>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
              Next
            </button>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}

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
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl border p-2 transition ${item.className} ${item.isSelected ? 'ring-2 ring-emerald-500' : ''} ${item.isToday ? 'outline outline-2 outline-offset-2 outline-emerald-400' : ''} ${item.isFuture ? 'cursor-not-allowed opacity-60' : ''}`}
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

          {isFutureSelected ? (
            <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              This day has not arrived yet. You can record prayers once the day starts.
            </p>
          ) : (
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
                          disabled={isSaving}
                          className="h-5 w-5 accent-emerald-500"
                        />
                        {prayer.label}
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-300">
                        <input
                          type="checkbox"
                          checked={status === 'qaza'}
                          onChange={(event) => updatePrayer(prayer.key, event.target.checked ? 'qaza' : 'missed')}
                          disabled={isSaving}
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
          )}
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Progress</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-slate-800">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><AppIcon name="check" className="h-4 w-4 text-emerald-600" />Prayers done this month</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.done}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4 dark:bg-slate-800">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><AppIcon name="qaza" className="h-4 w-4 text-red-500" />Qaza this month</p>
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




