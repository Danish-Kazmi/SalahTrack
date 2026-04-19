'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useCurrentUser } from '@/lib/useCurrentUser';

function buildNextPath(pathname, searchParams) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildLoginPath(nextPath) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isSupabaseConfigured || isLoading) return;
    if (!currentUser) {
      router.replace(buildLoginPath(buildNextPath(pathname, searchParams)));
    }
  }, [currentUser, isLoading, pathname, router, searchParams]);

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-xl px-4 pb-10">
        <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Supabase setup required</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable protected login.
          </p>
        </section>
      </main>
    );
  }

  if (isLoading || !currentUser) {
    return (
      <main className="mx-auto max-w-xl px-4 pb-10">
        <section className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-emerald-100 dark:bg-slate-900 dark:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Checking Session</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Loading your tracker...</h1>
        </section>
      </main>
    );
  }

  return children;
}
