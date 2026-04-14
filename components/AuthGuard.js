'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getLoginRedirectUrl } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function buildNextPath(pathname, searchParams) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextPath = buildNextPath(pathname, searchParams);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsCheckingAuth(false);
      return undefined;
    }

    let isMounted = true;

    async function requireUser() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        if (!user) {
          window.location.assign(getLoginRedirectUrl(nextPath));
          return;
        }

        setIsCheckingAuth(false);
      } catch {
        if (!isMounted) return;

        window.location.assign(getLoginRedirectUrl(nextPath));
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        window.location.assign(getLoginRedirectUrl(nextPath));
        return;
      }

      setIsCheckingAuth(false);
      router.refresh();
    });

    requireUser();

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [nextPath, router]);

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

  if (isCheckingAuth) {
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
