# Car Manager

A lightweight car tracking app built with Next.js, React, TypeScript, Tailwind CSS, and Google Sheets as the primary data store.

The project is designed as a practical MVP for tracking:

- fuel fill-ups
- service history
- non-fuel car expenses
- optional receipt uploads to Google Drive

## MVP Goal

The app solves one simple problem:

Store all recurring car costs in one place with a mobile-friendly interface and a spreadsheet-backed workflow that is easy to maintain.

## Core Features

- Dashboard with quick stats and latest activity
- Fuel history with liters, total cost, price per liter, and consumption helpers
- Service history with cost, odometer, location, and next-service reminder mileage
- Expense history for insurance, tolls, parking, and other non-fuel costs
- Google Sheets persistence
- Automatic sheet/tab creation with first-row headers
- Optional receipt upload endpoint using Google Drive

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Google Sheets API
- Google Drive API
- UUID

## Project Structure

```text
app/
  api/
    expenses/route.ts
    fuel/route.ts
    receipts/route.ts
    service/route.ts
  expenses/
  fuel/
  service/
  page.tsx

components/
  BottomNav.tsx
  ExpenseEntryForm.tsx
  FuelEntryForm.tsx
  ServiceEntryForm.tsx
  StatCard.tsx

lib/
  expense-entry.ts
  fuel-calculations.ts
  fuel-entry.ts
  google.ts
  service-entry.ts
  sheets.ts

services/
  expenseService.ts
  fuelService.ts
  serviceService.ts

types/
  car.ts
```

## How It Works

The app uses a simple flow:

1. The user fills a form in the UI.
2. A client-side service sends the payload to a route handler in `app/api/...`.
3. The route validates and normalizes the input.
4. The data is appended to the relevant Google Sheet tab.
5. The page reloads and reads fresh rows from Google Sheets.
6. Rows are mapped into typed objects and rendered in the UI.

## MVP Process Flow

### Fuel Flow

1. Open `/fuel/new`
2. Enter date, odometer, liters, total cost, station, and notes
3. Submit the form
4. `POST /api/fuel` calculates `price_per_liter`
5. The record is stored in `fuel_entries`
6. `/fuel` and the dashboard read the updated history and stats

### Service Flow

1. Open `/service/new`
2. Enter service type, date, odometer, cost, workshop, and optional next-service mileage
3. Submit the form
4. `POST /api/service` stores the record in `service_entries`
5. `/service` shows the latest work and next service target

### Expense Flow

1. Open `/expenses/new`
2. Enter category, date, total cost, vendor, and optional odometer
3. Submit the form
4. `POST /api/expenses` stores the record in `expense_entries`
5. `/expenses` updates totals and expense history

## Data Model

### `fuel_entries`

First row headers:

```text
id | date | odometer | liters | total_cost | price_per_liter | station | is_full_tank | notes | receipt_file_id | receipt_url | created_at | updated_at
```

### `service_entries`

First row headers:

```text
id | date | odometer | total_cost | service_type | location | next_service_odometer | notes | created_at | updated_at
```

### `expense_entries`

First row headers:

```text
id | date | category | total_cost | odometer | vendor | notes | created_at | updated_at
```

## Google Sheets Behavior

The app is defensive about sheet setup:

- if a tab does not exist, it is created automatically
- if the first row headers are missing or incorrect, they are written automatically
- rows are normalized into typed objects before rendering

This logic lives in `lib/sheets.ts`.

## Environment Variables

Create a local `.env.local` file with the following values:

```env
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your_google_sheet_id"
GOOGLE_DRIVE_RECEIPTS_FOLDER_ID="your_drive_folder_id"
```

## Google Setup

### 1. Create a Google Cloud project

- Enable the Google Sheets API
- Enable the Google Drive API

### 2. Create a service account

- Generate a JSON key
- Copy the service account email and private key into `.env.local`

### 3. Share your Google Sheet

- Open the target Google Sheet
- Share it with the service account email
- Give it Editor access

### 4. Optional: create a Drive folder for receipts

- Create a Google Drive folder
- Share it with the same service account
- Copy the folder ID into `GOOGLE_DRIVE_RECEIPTS_FOLDER_ID`

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Development Notes

- Route handlers live inside `app/api`
- Data fetching is server-side for page rendering
- Form submission is client-side
- The project currently uses Google Sheets as the database layer
- Receipt uploads are supported by `app/api/receipts/route.ts`, but are optional in the current MVP

## Current MVP Scope

Included:

- create and list fuel entries
- create and list service entries
- create and list expense entries
- dashboard summary for fuel
- mobile-first UI
- spreadsheet-backed persistence

Not yet fully expanded:

- edit and delete flows
- authentication and multi-user support
- charts and reporting
- recurring expense automation
- file attachment UI integration in all forms
- reminders/notifications

## Recommended Next Steps

- add edit and delete actions for all entry types
- expand dashboard to include service and expense summaries
- connect receipt upload in the forms
- add category filters and date filters
- add monthly and yearly reporting
- add export and backup utilities

## Security Notes

- Do not commit real secrets to the repository
- Keep `.env.local` private
- If real credentials were ever exposed during development, rotate them immediately
- Share Google Sheets and Drive folders only with the required service account

## Summary

Car Manager is a clean MVP for tracking vehicle running costs with minimal infrastructure.

Instead of a traditional database, it uses Google Sheets as a practical operational backend, making it easy to inspect, edit, and maintain data while still keeping a proper app structure in code.
