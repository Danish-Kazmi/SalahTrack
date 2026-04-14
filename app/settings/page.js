import { Suspense } from 'react';
import HeaderBar from '@/components/HeaderBar';
import AuthGuard from '@/components/AuthGuard';
import SettingsPanel from '@/components/SettingsPanel';

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <HeaderBar />
        <main className="mx-auto max-w-3xl px-4 pb-10">
          <SettingsPanel />
        </main>
      </AuthGuard>
    </Suspense>
  );
}
