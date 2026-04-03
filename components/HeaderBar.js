import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
      <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        SalahTrack
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/settings" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300">
          Settings
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

