import { Suspense } from 'react';
import HeaderBar from '@/components/HeaderBar';
import AuthGuard from '@/components/AuthGuard';
import ProfileEditorPanel from '@/components/ProfileEditorPanel';

export default function EditProfilePage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <HeaderBar />
        <main className="mx-auto max-w-3xl px-4 pb-10">
          <ProfileEditorPanel />
        </main>
      </AuthGuard>
    </Suspense>
  );
}
