import './globals.css';

export const metadata = {
  title: 'SalahTrack - Daily Prayer Tracker',
  description: 'Track your five daily prayers, monitor qaza, review monthly progress, and manage your personal salah history.',
  keywords: ['salah tracker', 'prayer tracker', 'namaz tracker', 'qaza tracker', 'daily prayer app'],
  authors: [{ name: 'SalahTrack' }],
  openGraph: {
    title: 'SalahTrack - Daily Prayer Tracker',
    description: 'A simple personal app to track daily salah, qaza prayers, and monthly progress.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-emerald-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
