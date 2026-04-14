'use client';

import { useEffect, useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { getCurrentUser } from '@/lib/auth';
import { fetchPrayerData, migrateLegacyPrayerDataToSupabase, normalizePrayerData, replacePrayerData } from '@/lib/prayerRecords';

export default function SettingsPanel() {
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        const userId = user?.id || '';
        setCurrentUserId(userId);

        if (userId) {
          const existingRecords = await fetchPrayerData(userId);

          if (Object.keys(existingRecords).length === 0) {
            await migrateLegacyPrayerDataToSupabase(userId);
          }
        }
      } catch (error) {
        if (!isMounted) return;

        setCurrentUserId('');
        setMessage(error.message || 'Unable to load your account settings.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function exportData() {
    setIsWorking(true);
    setMessage('Exporting from Supabase...');

    try {
      const data = await fetchPrayerData(currentUserId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prayer-tracker-export.json';
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Exported your current prayer data from Supabase.');
    } catch (error) {
      setMessage(error.message || 'Export failed.');
    } finally {
      setIsWorking(false);
    }
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsWorking(true);
    setMessage('Importing to Supabase...');

    try {
      const rawPayload = JSON.parse(await file.text());
      if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
        throw new Error('Invalid JSON structure.');
      }

      const payload = normalizePrayerData(rawPayload);
      await replacePrayerData(currentUserId, payload);
      setMessage('Imported data successfully to Supabase.');
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setIsWorking(false);
      event.target.value = '';
    }
  }

  async function resetData() {
    if (!window.confirm('Reset all prayer data in your account?')) return;

    setIsWorking(true);
    setMessage('Resetting your prayer data...');

    try {
      await replacePrayerData(currentUserId, {});
      setMessage('All prayer data has been reset.');
    } catch (error) {
      setMessage(error.message || 'Unable to reset your data.');
    } finally {
      setIsWorking(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loading account settings...</h1>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
      <h1 className="inline-flex items-center gap-3 text-3xl font-bold text-slate-900 dark:text-white">
        <AppIcon name="settings" className="h-7 w-7 text-emerald-600" />
        Settings
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Your prayer history now lives in Supabase and follows your signed-in account.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={exportData} disabled={isWorking} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70">
          <AppIcon name="check" />
          Export Data
        </button>
        <label className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 ${isWorking ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
          <AppIcon name="calendar" />
          Import Data
          <input type="file" accept="application/json" onChange={importData} disabled={isWorking} className="hidden" />
        </label>
      </div>

      <button type="button" onClick={resetData} disabled={isWorking} className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70">
        <AppIcon name="qaza" />
        Reset All Data
      </button>

      <p className="mt-6 min-h-[24px] text-sm font-medium text-slate-500 dark:text-slate-300">{message}</p>
    </section>
  );
}
