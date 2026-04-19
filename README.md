# SalahTrack

Developed By Danish Kazmi
SalahTrack is a simple prayer tracking app for recording daily salah, marking qaza, and reviewing monthly progress.

This app uses Supabase magic-link login, and prayer history is stored in Supabase per signed-in user.

## Live Demo

[https://salahtrack-ten.vercel.app](https://salahtrack-ten.vercel.app)

## Preview

![SalahTrack Preview](https://salahtrack-ten.vercel.app/opengraph-image)

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Supabase Auth for email magic-link login
- Supabase database for prayer history

## Features

- Track five daily prayers
- Mark prayers as done or qaza
- Navigate monthly calendar
- View total done and qaza stats
- Monthly progress bar
- Dark / light mode toggle
- Export, import, and reset local data
- Protected calendar and settings pages
- SEO-friendly sitemap, robots.txt, metadata, and app icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Open:

```bash
http://localhost:3000
```

## Project Structure

```text
app/
  calendar/
    page.js
  settings/
    page.js
  globals.css
  icon.svg
  layout.js
  manifest.js
  opengraph-image.js
  page.js
  robots.js
  sitemap.js
components/
  HeaderBar.js
  PrayerCalendar.js
  SettingsPanel.js
  ThemeToggle.js
lib/
  prayerRecords.js
  prayers.js
supabase/
  prayer_records.sql
```

## Supabase Setup

1. Create a Supabase project and enable Email OTP / magic links.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Run the SQL in [supabase/prayer_records.sql](c:/laragon/www/tracker/supabase/prayer_records.sql) inside the Supabase SQL editor.
4. Start the app and sign in. If a browser still has the old local-only data, the app will migrate it into Supabase the first time that user opens the tracker.

## Notes

Theme preference still uses browser LocalStorage. Prayer history, import/export, and reset now use Supabase.
