'use client';

import { useEffect, useState } from 'react';
import AppIcon from '@/components/AppIcon';
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

  const nextThemeLabel = isDark ? 'Light mode' : 'Dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel}`}
      title={`Switch to ${nextThemeLabel}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
    >
      <AppIcon name={isDark ? 'sun' : 'moon'} className="h-5 w-5" />
    </button>
  );
}
