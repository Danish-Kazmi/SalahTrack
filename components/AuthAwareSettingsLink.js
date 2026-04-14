'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AuthAwareSettingsLink({ className = '' }) {
  const { currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return null;
  }

  return (
    <Link href="/settings" className={className}>
      <AppIcon name="settings" className="h-4 w-4" />
      Settings
    </Link>
  );
}
