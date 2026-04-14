'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCurrentUser(null);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function syncUser() {
      try {
        const user = await getCurrentUser();

        if (!isMounted) return;

        setCurrentUser(user);
      } catch {
        if (!isMounted) return;

        setCurrentUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setCurrentUser(session?.user || null);
      setIsLoading(false);
    });

    syncUser();

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { currentUser, isLoading };
}
