'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCurrentUser } from '@/lib/useCurrentUser';

function getUserLabel(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
}

export default function HeaderUser() {
  const { currentUser } = useCurrentUser();

  const userLabel = getUserLabel(currentUser);

  return (
    <Link
      href={userLabel ? '/calendar' : '/login'}
      title={userLabel ? `Signed in as ${userLabel}` : 'Login'}
      className="inline-flex min-w-0 max-w-44 items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300"
    >
      <AppIcon name="check" className="h-4 w-4 shrink-0" />
      <span className="truncate">{userLabel || 'Login'}</span>
    </Link>
  );
}
