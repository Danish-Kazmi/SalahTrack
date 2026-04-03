import HeaderBar from '@/components/HeaderBar';
import SettingsPanel from '@/components/SettingsPanel';

export default function SettingsPage() {
  return (
    <>
      <HeaderBar />
      <main className="mx-auto max-w-3xl px-4 pb-10">
        <SettingsPanel />
      </main>
    </>
  );
}
