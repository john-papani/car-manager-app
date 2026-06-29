# Car Manager

A mobile-first vehicle cost tracker built with Next.js, TypeScript, and Google Sheets.

Car Manager helps a driver keep fuel fill-ups, service history, and other car expenses in one place through a lightweight app interface, while using Google Sheets as a simple, inspectable backend.

## Overview

This project was built as a practical MVP for tracking recurring vehicle costs without setting up a traditional database.

Instead of hiding everything behind an admin panel or database dashboard, the app stores structured data in Google Sheets, making it easy to review, maintain, and back up entries outside the app as well.

## Features

- Fuel tracking with date, odometer, liters, total cost, station, notes, and full-tank flag
- Automatic fuel calculations such as price per liter, average consumption, and cost trends
- Service history tracking with mileage, cost, workshop/location, and next service odometer
- Non-fuel expense tracking for insurance, tolls, parking, and other car-related costs
- Dashboard with summary cards and visual charts for fuel consumption and spending distribution
- Vehicle profile management for make, model, trim, year, plate, engine, and other details
- Demo account for quick testing without connecting Google services
- Google sign-in for Drive-connected features
- Optional receipt photo upload to Google Drive for fuel entries
- Monthly report export/print flow from the dashboard
- Delete actions for entries
- Automatic Google Sheets tab creation and header initialization
- Optional Google Calendar event creation for fuel entries

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Auth.js / NextAuth
- Google Sheets API
- Google Drive API
- Google Calendar API
- UUID
- ESLint

## How It Works

1. The user signs in with either the demo account or Google.
2. Forms submit data to route handlers inside `app/api`.
3. Route handlers validate and normalize the payload.
4. Data is written into the corresponding Google Sheet tab.
5. Server-rendered pages fetch fresh data from Google Sheets.
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
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your_google_sheet_id"

# Optional for receipt uploads
GOOGLE_DRIVE_RECEIPTS_FOLDER_ID="your_drive_folder_id"

# Optional for fuel calendar events
GOOGLE_CALENDAR_ID="your_calendar_id"

# Required for Google sign-in
AUTH_GOOGLE_ID="your_google_oauth_client_id"
AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"
AUTH_SECRET="your_auth_secret"

# Demo login (enabled in development by default; set to "true" to force on, "false" to force off)
ENABLE_DEMO_LOGIN="true"
```

### 3. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000`

## Demo Login

You can test the app locally with the built-in demo account:

- Username: `user`
- Password: `user`

The demo account is read-only and uses mock data.

## Google Setup

### Google Sheets

- Create a Google Cloud project
- Enable the Google Sheets API
- Create a service account
- Generate a JSON key
- Share your target Google Sheet with the service account email as Editor

### Google Drive

Used for optional receipt uploads.

- Enable the Google Drive API
- Create a Drive folder
- Add its ID to `GOOGLE_DRIVE_RECEIPTS_FOLDER_ID`
- Sign in with a Google account that has access to that folder

### Google Calendar

Used for optional fuel-entry calendar events.

- Enable the Google Calendar API
- Set `GOOGLE_CALENDAR_ID`

### Google OAuth

Used for Google sign-in inside the app.

- Create OAuth credentials for a Web application
- Add this redirect URI in development:

```text
http://localhost:3000/api/auth/callback/google
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Project Structure

```text
app/
  api/
    auth/[...nextauth]/
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
  sheets.ts
  calendar.ts
  current-user-data.ts
  demo-mode.ts
  fuel-calculations.ts

services/
  fuelService.ts
  expenseService.ts
  serviceService.ts
  vehicleService.ts

types/
  car.ts
  next-auth.d.ts

public/
  manifest.json
  car-icon.svg
```

## Known Limitations

- Google Sheets is practical for an MVP, but it is not a replacement for a full relational database
- Edit/update flows for entries are not implemented yet
- Receipt uploads are currently connected to fuel entries only
- Multi-user data separation is still limited in scope
- Production deployment would need stronger operational hardening around secrets and Google setup

## Roadmap

- Add edit/update flows for all entry types
- Add filters by date, category, and mileage
- Expand reporting with monthly and yearly summaries
- Improve export and backup options
- Add stronger multi-user support
- Improve attachment handling across more forms