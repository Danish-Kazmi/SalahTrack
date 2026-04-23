'use client';

import Link from 'next/link';
import AppIcon from '@/components/AppIcon';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function AuthAwareProfileLink({ className = '' }) {
  const { currentUser, isLoading } = useCurrentUser();

  if (isLoading || !currentUser) {
    return null;
  }

  return (
    <Link href="/profile" className={className}>
      <AppIcon name="check" className="h-4 w-4" />
      Profile
    </Link>
  );
}
