import Link from 'next/link';
import AppIcon from './AppIcon';
import HeaderUser from './HeaderUser';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        <AppIcon name="home" className="h-4 w-4" />
        SalahTrack
      </Link>
      <div className="flex items-center gap-4">
        <HeaderUser />
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300">
          <AppIcon name="settings" className="h-4 w-4" />
          Settings
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
