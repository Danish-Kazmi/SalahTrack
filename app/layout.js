import './globals.css';
import { AuthProvider } from '@/lib/useCurrentUser';

export const metadata = {
  metadataBase: new URL('https://salahtrack-ten.vercel.app'),
  title: 'SalahTrack - Daily Prayer Tracker',
  description: 'Track your five daily prayers, monitor qaza, review monthly progress, and manage your personal salah history.',
  keywords: ['salah tracker', 'prayer tracker', 'namaz tracker', 'qaza tracker', 'daily prayer app'],
  authors: [{ name: 'SalahTrack' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SalahTrack - Daily Prayer Tracker',
    description: 'A simple personal app to track daily salah, qaza prayers, and monthly progress.',
    url: 'https://salahtrack-ten.vercel.app',
    siteName: 'SalahTrack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalahTrack - Daily Prayer Tracker',
    description: 'Track daily salah, qaza prayers, and monthly progress in a simple personal dashboard.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('prayer-tracker-theme');var p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&p)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-emerald-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

