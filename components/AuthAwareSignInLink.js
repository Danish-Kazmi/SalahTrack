'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AuthAwareSignInLink({ className = '' }) {
  const { currentUser, isLoading } = useCurrentUser();

  if (isLoading || currentUser) {
    return null;
  }

  return (
    <Link href="/login" className={className}>
      <AppIcon name="check" />
      Sign In
    </Link>
  );
}
