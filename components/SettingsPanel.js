'use client';

import { useState } from 'react';
import { readPrayerData, writePrayerData } from '@/lib/prayers';

export default function SettingsPanel() {
  const [message, setMessage] = useState('');

  function exportData() {
    const data = readPrayerData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prayer-tracker-export.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Exported your current local prayer data.');
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = JSON.parse(await file.text());
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Invalid JSON structure.');
      }

      writePrayerData(payload);
      setMessage('Imported data successfully.');
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  }

  function resetData() {
    if (!window.confirm('Reset all local prayer data?')) return;
    writePrayerData({});
    setMessage('All local prayer data has been reset.');
  }

  return (
    <section className="mt-6 rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Frontend is ready for now. This page still uses local JSON storage until we connect Supabase.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={exportData} className="rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white hover:bg-emerald-600">
          Export Data
        </button>
        <label className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300">
          Import Data
          <input type="file" accept="application/json" onChange={importData} className="hidden" />
        </label>
      </div>

      <button type="button" onClick={resetData} className="mt-4 rounded-2xl bg-red-500 px-6 py-4 font-semibold text-white hover:bg-red-600">
        Reset All Data
      </button>

      <p className="mt-6 min-h-[24px] text-sm font-medium text-slate-500 dark:text-slate-300">{message}</p>
    </section>
  );
}
