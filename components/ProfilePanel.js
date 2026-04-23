'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { fetchPrayerData, fetchPrayerDataRange } from '@/lib/prayerRecords';
import { PRAYERS, formatDateKey, getMonthRange } from '@/lib/prayers';
import { useCurrentUser } from '@/lib/useCurrentUser';

function getDisplayName(user) {
  const metadata = user?.user_metadata || {};
  return metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'Member';
}

function getInitials(user) {
  const metadata = user?.user_metadata || {};
  const source = metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'M';
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  }

  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'M';
}

function formatMemberSince(createdAt) {
  if (!createdAt) return 'Unknown';

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function isAllDone(dayRecord = {}) {
  return PRAYERS.every((prayer) => dayRecord?.[prayer.key] === 'done');
}

function getLifetimeStats(data) {
  const entries = Object.entries(data || {});
  const recordedDays = entries.length;
  let doneCount = 0;
  let qazaCount = 0;

  entries.forEach(([, dayRecord]) => {
    PRAYERS.forEach((prayer) => {
      const status = dayRecord?.[prayer.key];
      if (status === 'done') doneCount += 1;
      if (status === 'qaza') qazaCount += 1;
    });
  });

  const totalSlots = recordedDays * PRAYERS.length;
  const completionRate = totalSlots > 0 ? Math.round((doneCount / totalSlots) * 100) : 0;
  const allDoneDates = entries
    .filter(([, dayRecord]) => isAllDone(dayRecord))
    .map(([dateKey]) => dateKey)
    .sort();

  const allDoneSet = new Set(allDoneDates);
  const today = new Date();
  let currentStreak = 0;
  let streakDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  while (allDoneSet.has(formatDateKey(streakDate))) {
    currentStreak += 1;
    streakDate.setDate(streakDate.getDate() - 1);
  }

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  allDoneDates.forEach((dateKey) => {
    const currentDate = new Date(`${dateKey}T00:00:00`);

    if (!previousDate) {
      runningStreak = 1;
    } else {
      const difference = Math.round((currentDate - previousDate) / 86400000);
      runningStreak = difference === 1 ? runningStreak + 1 : 1;
    }

    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }

    previousDate = currentDate;
  });

  return {
    recordedDays,
    completionRate,
    currentStreak,
    bestStreak,
    qazaCount,
    doneCount,
  };
}

function getMonthPrayerStats(data, today) {
  const daysSoFar = today.getDate();
  const todayKey = formatDateKey(today);

  return PRAYERS.map((prayer) => {
    let doneDays = 0;

    Object.entries(data || {}).forEach(([dateKey, dayRecord]) => {
      if (dateKey <= todayKey && dayRecord?.[prayer.key] === 'done') {
        doneDays += 1;
      }
    });

    const percentage = daysSoFar > 0 ? Math.round((doneDays / daysSoFar) * 100) : 0;

    return {
      ...prayer,
      doneDays,
      percentage,
    };
  });
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/80">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function ProfilePanel() {
  const { currentUser, isLoading } = useCurrentUser();
  const currentUserId = currentUser?.id || '';
  const [lifetimeStats, setLifetimeStats] = useState({
    recordedDays: 0,
    completionRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    qazaCount: 0,
    doneCount: 0,
  });
  const [monthPrayerStats, setMonthPrayerStats] = useState(() => PRAYERS.map((prayer) => ({ ...prayer, doneDays: 0, percentage: 0 })));
  const [daysSoFar, setDaysSoFar] = useState(new Date().getDate());
  const [isPanelLoading, setIsPanelLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!currentUserId) {
      setIsPanelLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function loadProfileData() {
      setIsPanelLoading(true);
      setLoadError('');

      try {
        const today = new Date();
        const { startDateKey, endDateKey } = getMonthRange(today);
        const [lifetimeData, monthData] = await Promise.all([
          fetchPrayerData(currentUserId),
          fetchPrayerDataRange(currentUserId, startDateKey, endDateKey),
        ]);

        if (!isMounted) return;

        setLifetimeStats(getLifetimeStats(lifetimeData));
        setMonthPrayerStats(getMonthPrayerStats(monthData, today));
        setDaysSoFar(today.getDate());
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.message || 'Unable to load your profile right now.');
      } finally {
        if (isMounted) {
          setIsPanelLoading(false);
        }
      }
    }

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  if (isLoading || isPanelLoading) {
    return (
      <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loading...</h1>
      </section>
    );
  }

  const avatarUrl = currentUser?.user_metadata?.avatar_url;
  const displayName = getDisplayName(currentUser);
  const email = currentUser?.email || 'No email available';
  const memberSince = formatMemberSince(currentUser?.created_at);

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-20 w-20 rounded-full border border-emerald-100 object-cover shadow-sm dark:border-slate-700"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none">
              {getInitials(currentUser)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{email}</p>
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lifetime Stats</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your long-term consistency across every recorded day in SalahTrack.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatTile label="Recorded Days" value={lifetimeStats.recordedDays} />
          <StatTile label="Completion Rate" value={`${lifetimeStats.completionRate}%`} />
          <StatTile label="Current Streak" value={lifetimeStats.currentStreak} />
          <StatTile label="Best Streak" value={lifetimeStats.bestStreak} />
          <StatTile label="Qaza Count" value={lifetimeStats.qazaCount} />
          <StatTile label="Prayers Done" value={lifetimeStats.doneCount} />
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">This Month</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Completion by prayer across the {daysSoFar} day{daysSoFar === 1 ? '' : 's'} in this month so far.
        </p>

        <div className="mt-6 space-y-4">
          {monthPrayerStats.map((prayer) => (
            <div key={prayer.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">{prayer.label}</span>
                <span className="text-slate-500 dark:text-slate-300">{prayer.percentage}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${prayer.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Done on {prayer.doneDays} of {daysSoFar} day{daysSoFar === 1 ? '' : 's'}.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/calendar"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 dark:shadow-none sm:flex-1"
          >
            <AppIcon name="calendar" />
            Open Calendar
          </Link>
          <Link
            href="/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 sm:flex-1"
          >
            <AppIcon name="settings" />
            Account Settings
          </Link>
        </div>
        {loadError ? (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{loadError}</p>
        ) : null}
      </div>
    </section>
  );
}
