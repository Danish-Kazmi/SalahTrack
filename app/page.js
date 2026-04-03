import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl bg-white/90 p-8 text-center shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">SalahTrack</p>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Track Your Salah Daily</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600 dark:text-slate-300">
          Record your five daily prayers, mark qaza, review past days, and monitor your monthly progress in one simple dashboard.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/calendar" className="rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 dark:shadow-none">
            Open Tracker
          </Link>
          <Link href="/calendar" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300">
            View Progress
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/settings" className="text-slate-500 underline underline-offset-4 hover:text-emerald-600 dark:text-slate-300">
            Settings
          </Link>
          <ThemeToggle />
        </div>
      </section>
    </main>
  );
}

