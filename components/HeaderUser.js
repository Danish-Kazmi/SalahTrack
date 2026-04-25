'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
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

export default function HeaderUser({ directToProfile = false }) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);

  const userLabel = getUserLabel(currentUser);
  const avatarUrl = currentUser?.user_metadata?.avatar_url;
  const isSignedIn = Boolean(userLabel);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      setIsOpen(false);
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }

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

  if (directToProfile) {
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

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title={`Signed in as ${userLabel}`}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-w-0 max-w-52 items-center gap-2 rounded-full text-sm font-medium text-slate-600 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 dark:text-slate-300 dark:focus-visible:ring-emerald-900/40"
        aria-haspopup="menu"
        aria-expanded={isOpen}
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
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-30 mt-3 w-52 overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 p-2 shadow-2xl shadow-emerald-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none"
          role="menu"
        >
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
            role="menuitem"
          >
            My Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
            role="menuitem"
          >
            Account Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:text-red-400 dark:hover:bg-red-950/40"
            role="menuitem"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
