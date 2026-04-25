'use client';

import Link from 'next/link';
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
  const isSignedIn = Boolean(userLabel);

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        title="Login"
        className="inline-flex min-w-0 max-w-52 items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300"
      >
        <span className="truncate">Login</span>
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      title={`Signed in as ${userLabel}`}
      className="inline-flex min-w-0 max-w-52 items-center gap-2 rounded-full text-sm font-medium text-slate-600 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-slate-300 dark:focus-visible:ring-emerald-900/40"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userLabel}
          className="h-8 w-8 shrink-0 rounded-full border border-emerald-100 object-cover shadow-sm dark:border-slate-700"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          {getInitials(currentUser)}
        </span>
      )}
      <span className="truncate">{userLabel}</span>
    </Link>
  );
}
