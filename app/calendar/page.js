import { Suspense } from 'react';
import HeaderBar from '@/components/HeaderBar';
import AuthGuard from '@/components/AuthGuard';
import PrayerCalendar from '@/components/PrayerCalendar';

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <HeaderBar />
        <PrayerCalendar />
      </AuthGuard>
    </Suspense>
  );
}
