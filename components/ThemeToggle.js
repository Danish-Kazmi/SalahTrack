'use client';

import { useEffect, useState } from 'react';
import { THEME_KEY } from '@/lib/prayers';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle('dark', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme ? 'dark' : 'light');
    setIsDark(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
