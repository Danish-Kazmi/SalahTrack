import HeaderBar from '@/components/HeaderBar';
import SettingsGate from '@/components/SettingsGate';

export default function SettingsPage() {
  return (
    <>
      <HeaderBar />
      <main className="mx-auto max-w-3xl px-4 pb-10">
        <SettingsGate />
      </main>
    </>
  );
}
