'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCurrentUser } from '@/lib/useCurrentUser';

function getUserLabel(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
}

function getInitials(user) {
  const source = getUserLabel(user) || 'L';
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  }

  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'L';
}

export default function HeaderUser() {
  const { currentUser } = useCurrentUser();

  const userLabel = getUserLabel(currentUser);
  const avatarUrl = currentUser?.user_metadata?.avatar_url;

  return (
    <Link
      href={userLabel ? '/profile' : '/login'}
      title={userLabel ? `Signed in as ${userLabel}` : 'Login'}
      className="inline-flex min-w-0 max-w-52 items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300"
    >
      <AppIcon name="check" className="h-4 w-4 shrink-0" />
      {userLabel ? (
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userLabel}
            className="h-8 w-8 shrink-0 rounded-full border border-emerald-100 object-cover shadow-sm dark:border-slate-700"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {getInitials(currentUser)}
          </span>
        )
      ) : null}
      <span className="truncate">{userLabel || 'Login'}</span>
    </Link>
  );
}
