# SalahTrack

SalahTrack is a simple prayer tracking app for recording daily salah, marking qaza, and reviewing monthly progress.

## Tech Stack

- Next.js
- React
- Tailwind CSS
- LocalStorage for temporary frontend-only data

## Features

- Track five daily prayers
- Mark prayers as done or qaza
- Navigate monthly calendar
- View total done and qaza stats
- Monthly progress bar
- Dark / light mode toggle
- Export, import, and reset local data

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
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
  layout.js
  page.js
components/
  HeaderBar.js
  PrayerCalendar.js
  SettingsPanel.js
  ThemeToggle.js
lib/
  prayers.js
```

## Notes

Currently, prayer data is stored in browser LocalStorage. Later, this can be replaced with Supabase Auth + Database so each user can have their own saved prayer history online.
