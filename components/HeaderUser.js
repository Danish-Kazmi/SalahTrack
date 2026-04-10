'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { getCurrentUser } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

function getUserLabel(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
}

export default function HeaderUser() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let isMounted = true;

    async function syncUser() {
      try {
        const user = await getCurrentUser();

        if (isMounted) {
          setCurrentUser(user);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setCurrentUser(session?.user || null);
      }
    });

    syncUser();

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const userLabel = getUserLabel(currentUser);

  return (
    <Link
      href="/login"
      title={userLabel ? `Signed in as ${userLabel}` : 'Login'}
      className="inline-flex min-w-0 max-w-44 items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300"
    >
      <AppIcon name="check" className="h-4 w-4 shrink-0" />
      <span className="truncate">{userLabel || 'Login'}</span>
    </Link>
  );
}
