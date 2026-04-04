import HeaderBar from '@/components/HeaderBar';
import AuthPanel from '@/components/AuthPanel';

export default function LoginPage() {
  return (
    <>
      <HeaderBar />
      <main className="mx-auto max-w-xl px-4 pb-10">
        <AuthPanel />
      </main>
    </>
  );
}