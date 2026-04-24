import Link from 'next/link';
import AppIcon from './AppIcon';
import HeaderUser from './HeaderUser';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar() {
  return (
    <header className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        <AppIcon name="home" className="h-4 w-4" />
        SalahTrack
      </Link>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:gap-4">
        <HeaderUser />
        <ThemeToggle />
      </div>
    </header>
  );
}
