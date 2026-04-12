'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SettingsPanel from '@/components/SettingsPanel';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function SettingsGate() {
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return null;
  }

  return <SettingsPanel />;
}
