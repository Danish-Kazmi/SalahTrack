import { Suspense } from 'react';
import HeaderBar from '@/components/HeaderBar';
import AuthGuard from '@/components/AuthGuard';
import ProfilePanel from '@/components/ProfilePanel';

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <HeaderBar />
        <main className="mx-auto max-w-3xl px-4 pb-10">
          <ProfilePanel />
        </main>
      </AuthGuard>
    </Suspense>
  );
}
