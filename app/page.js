import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import AuthAwareSignInLink from '@/components/AuthAwareSignInLink';
import HeaderUser from '@/components/HeaderUser';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
      <section className="w-full max-w-xl rounded-3xl bg-white/90 p-5 text-center shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none sm:p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 sm:text-sm">SalahTrack</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-4xl">Track Your Salah Daily</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300 sm:mt-4 sm:text-base">
          Record your five daily prayers, mark qaza, review past days, and monitor your monthly progress in one simple dashboard.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link href="/calendar" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 dark:shadow-none sm:w-auto sm:flex-1 sm:min-w-[200px] sm:py-4">
            <AppIcon name="calendar" />
            Open Tracker
          </Link>
          <AuthAwareSignInLink className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 sm:w-auto sm:flex-1 sm:min-w-[200px] sm:py-4" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm sm:mt-10">
          <HeaderUser directToProfile />
          <ThemeToggle />
        </div>
      </section>
    </main>
  );
}

