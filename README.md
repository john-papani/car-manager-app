# Car Manager

A mobile-first vehicle cost tracker built with Next.js, TypeScript, and Supabase.

Car Manager helps a driver keep fuel fill-ups, service history, and other car expenses in one place through a lightweight app interface, while using Supabase for structured storage, per-user separation, and easier scaling than the original Google Sheets MVP.

## Overview

This project started as a Google Sheets MVP and now uses Supabase as the main backend for application data.

The UI and route structure stay lightweight, but the persistence layer is now better suited for multi-user data, more reliable querying, and future growth.

## Version History

- `v1`: application data was stored in Google Sheets
- `current`: application data is stored in Supabase

Because of that backend change, existing data from the Google Sheets version needs a one-time migration into Supabase for older installs.

## Features

- Fuel tracking with date, odometer, liters, total cost, station, notes, and full-tank flag
- Automatic fuel calculations such as price per liter, average consumption, and cost trends
- Service history tracking with mileage, cost, workshop/location, and next service odometer
- Non-fuel expense tracking for insurance, tolls, parking, and other car-related costs
- Dashboard with summary cards and visual charts for fuel consumption and spending distribution
- Vehicle profile management for make, model, trim, year, plate, engine, and other details
- Email/password authentication through Supabase Auth
- Supabase-backed fuel, service, expense, and vehicle profile storage
- Optional receipt photo upload through Supabase Storage
- Monthly report export/print flow from the dashboard
- Delete actions for entries
- Optional Google Calendar event creation for fuel entries

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR Auth
- Supabase
- Google Calendar API
- UUID
- ESLint

## How It Works

1. The user signs in with Supabase Auth.
2. Forms submit data to route handlers inside `app/api`.
3. Route handlers validate and normalize the payload.
4. Data is written into Supabase tables.
5. Server-rendered pages fetch fresh data from Supabase.
6. The dashboard calculates summaries and renders charts from typed entries.

## Entry Types

### Fuel entries

Store:

- date
- odometer
- liters
- total cost
- calculated price per liter
- station
- full tank status
- notes
- optional receipt file and URL

### Service entries

Store:

- date
- odometer
- service type
- total cost
- location
- next service odometer
- notes

### Expense entries

Store:

- date
- category
- total cost
- optional odometer
- vendor
- notes

### Vehicle profile

Store:

- make
- model
- trim
- year
- license plate
- fuel type
- transmission
- engine
- color

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
SUPABASE_RECEIPTS_BUCKET="fuel-receipts"

# Optional for fuel calendar events
GOOGLE_CALENDAR_ID="your_calendar_id"
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000`

## Supabase Setup

### 1. Create the project

- Create a new project in Supabase
- Copy the project URL
- Copy the publishable key
- Copy the service role key

### 2. Run the schema

- Open the SQL Editor in Supabase
- Run [`supabase/schema.sql`](supabase/schema.sql)
- Confirm that the tables and the `fuel-receipts` storage bucket were created

### 3. Configure environment variables

- Add `NEXT_PUBLIC_SUPABASE_URL`
- Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Add `SUPABASE_SERVICE_ROLE_KEY`
- Optionally override `SUPABASE_RECEIPTS_BUCKET`

### 4. Enable email/password auth

- Open `Authentication -> Providers` in Supabase
- Enable `Email`
- Decide whether you want `Confirm email` on or off

### 5. Create the first user

You have two options:

- Easiest: run the app and create the user from `/login`
- Or create a user manually in `Authentication -> Users`

### Password reset

1. In Supabase `Authentication -> URL Configuration`, set the Site URL to the production app URL and add `https://your-domain/reset-password` to the Redirect URLs (also add `http://localhost:3000/reset-password` for local testing).
2. In `Authentication -> Email Templates -> Reset password`, replace the link's `href` with:

   ```html
   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery
   ```

   Keep the rest of the email template. The app verifies this one-time token before allowing a new password. This link also works when the email is opened on another device. The default `{{ .ConfirmationURL }}` link uses a PKCE code and must be opened in the same browser where the reset was requested.
3. Use **Ξέχασες τον κωδικό σου;** on `/login`. Supabase's default email service has a low sending limit; configure custom SMTP if reset emails are needed in production.

### Google Calendar

Still optional and used only for fuel-entry calendar events.

- Enable the Google Calendar API
- Set `GOOGLE_CALENDAR_ID`

## Data Migration

This migration exists because the original `v1` app used Google Sheets, while the current version uses Supabase.

To move the existing Google Sheets entries into Supabase:

1. Create the target user in Supabase Auth first. Use that user's email with the command below.
2. Share the Google spreadsheet with the service account in `GOOGLE_CLIENT_EMAIL` and confirm it has tabs named `fuel_entries`, `service_entries`, `expense_entries`, and `vehicle_profile`.
3. Keep these env vars filled:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Preview and validate the rows without writing:

```bash
npm run migrate:sheets-to-supabase -- --owner-email=your@email.com
```

5. Check the printed counts, then import:

```bash
npm run migrate:sheets-to-supabase -- --owner-email=your@email.com --apply
```

The script resolves the email to the Supabase Auth user ID. Running it again updates rows with the same IDs; take a database backup first if you have edited any imported rows in the app.

The script migrates:

- fuel entries
- service entries
- expense entries
- vehicle profile

It does **not** migrate uploaded files. Existing Google Drive receipt links remain in the records when available; the files stay in Drive and still need appropriate sharing permissions.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run migrate:sheets-to-supabase -- --owner-email=your@email.com --apply
```

## Project Structure

```text
app/
  api/
    drive-check/
    expenses/
    fuel/
    receipts/
    service/
    vehicle/
  account/
  expenses/
  fuel/
  login/
  service/
  page.tsx
  layout.tsx

components/
  FuelEntryForm.tsx
  ExpenseEntryForm.tsx
  ServiceEntryForm.tsx
  VehicleProfileForm.tsx
  ShareReportButton.tsx
  ConsumptionBarChart.tsx
  CostDonutChart.tsx
  DeleteEntryButton.tsx

lib/
  google.ts
  calendar.ts
  current-user-data.ts
  fuel-calculations.ts

services/
  fuelService.ts
  expenseService.ts
  serviceService.ts
  vehicleService.ts

types/
  car.ts

public/
  manifest.json
  car-icon.svg
```

## Migration Notes

- Main app data now lives in Supabase, not Google Sheets
- Existing Google Sheets data moves with `npm run migrate:sheets-to-supabase`
- Calendar integration still uses Google service-account credentials if you want fuel events

## Known Limitations

- Receipt uploads are currently connected to fuel entries only
- Production deployment should keep `SUPABASE_SERVICE_ROLE_KEY` server-side only

## Supabase keep-alive cron

Vercel runs `/api/cron/keep-alive` once daily at 06:00 UTC (Hobby may run at any time during that hour). The endpoint reads at most one `vehicle_profiles.id` row; it never modifies data. Supabase Free project pausing is based on database activity, so this reduces the chance of an inactivity pause but does not guarantee prevention.

In Vercel **Settings → Environment Variables**, configure `CRON_SECRET` as a long random string for **Production**. Keep the existing `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) set for Production. The service-role/secret key must stay server-side. Redeploy after setting the variables; Vercel schedules crons only on production deployments.

After deployment, check **Vercel → Settings → Cron Jobs** and inspect the function logs after the first run. To verify manually, call `GET https://your-domain/api/cron/keep-alive` with `Authorization: Bearer <CRON_SECRET>`; it should return `{"ok":true}`. Without the header it returns 401, and a failed database read returns 502. Never put the cron secret in a browser URL or commit it to the repository.

## Roadmap

- Add edit/update flows for all entry types
- Add filters by date, category, and mileage
- Expand reporting with monthly and yearly summaries
- Improve export and backup options
- Add stronger multi-user support
- Improve attachment handling across more forms
