# Car Manager — χάρτης εφαρμογής

## Σκοπός και σημερινό εύρος

Προσωπικό ημερολόγιο ενός οχήματος με γρήγορη καταχώρηση από κινητό και
εικόνα του κόστους χρήσης. Τα Google Sheets είναι η κύρια μόνιμη αποθήκη,
χωρίς ξεχωριστή βάση δεδομένων. Το domain περιλαμβάνει `FuelEntry`,
`ServiceEntry`, `ExpenseEntry`, `VehicleProfile` στο `types/car.ts`.

Υπάρχουν δημιουργία/επεξεργασία/διαγραφή καταχωρήσεων, φίλτρα και αναζήτηση,
απλή αρχική οθόνη καθημερινών ενεργειών, αναφορές μήνα/έτους με εκτύπωση/PDF μέσω browser, υπενθυμίσεις
service, αποδείξεις καυσίμων στο Drive και offline queue νέων καταχωρήσεων.
Το demo χρησιμοποιεί mock data και δεν επιτρέπει writes.

## Ροές δεδομένων

- **Ανάγνωση:** server page → `lib/current-user-data.ts` → demo mock data ή
  `getCachedRows` → Google Sheets → row mapper/validation → typed entries → UI.
  Τα entry loaders με health επιστρέφουν και πλήθος άκυρων γραμμών.
- **Εγγραφή:** client form → `services/*Service.ts` → `app/api/*/route.ts`
  → session guard → Zod validation → row serialization → `lib/sheets.ts`
  → cache tag/path revalidation. Τα IDs και timestamps δημιουργούνται στον server.
- **Offline δημιουργία:** `lib/offline-create.ts` → IndexedDB queue →
  `lib/offline-sync.ts` → ίδια POST APIs όταν υπάρχει δίκτυο. Το
  `components/OfflineProvider.tsx` συντονίζει τον browser και το `public/sw.js`.
- **Απόδειξη καυσίμων:** upload στο `/api/receipts` με Google user token →
  Drive file ID/URL → PATCH στο `/api/fuel`. Στο offline sync η δημιουργία
  της εγγραφής προηγείται του upload και της σύνδεσης απόδειξης.

## Πού γίνεται κάθε αλλαγή

Τα paths είναι σχετικά με τη ρίζα του repo.

| Περιοχή | Αρχεία εκκίνησης |
| --- | --- |
| Αρχική οθόνη | `app/page.tsx`, `components/ServiceReminderBanner.tsx`, `components/FuelCostBarChart.tsx`, `components/CostDonutChart.tsx` |
| Καύσιμα | `app/fuel/`, `components/FuelEntryForm.tsx`, `components/FuelEntryList.tsx`, `services/fuelService.ts`, `app/api/fuel/route.ts` |
| Service / έξοδα | `app/service/`, `app/expenses/`, αντίστοιχα `*EntryForm.tsx`, `*EntryList.tsx`, `services/`, `app/api/` |
| Προφίλ οχήματος | `app/account/page.tsx`, `components/VehicleProfileForm.tsx`, `services/vehicleService.ts`, `app/api/vehicle/route.ts` |
| Storage / parsing | `lib/sheets.ts`, `lib/sheet-parse.ts`, `lib/row-load-result.ts`, `lib/fuel-entry.ts`, `lib/service-entry.ts`, `lib/expense-entry.ts`, `lib/vehicle-profile.ts` |
| Validation / τύποι | `lib/validation.ts`, `types/car.ts` |
| Auth / demo | `auth.ts`, `proxy.ts`, `lib/require-session.ts`, `lib/auth-server.ts`, `lib/demo-mode.ts`, `lib/mock-data.ts` |
| Google integrations | `lib/google.ts`, `lib/calendar.ts`, `app/api/receipts/route.ts`, `app/api/drive-check/route.ts` |
| Υπολογισμοί / αναφορές | `lib/fuel-calculations.ts`, `lib/report-calculations.ts`, `components/FuelCostBarChart.tsx`, `components/CostDonutChart.tsx`, `components/ShareReportButton.tsx` |
| Φίλτρα / υπενθυμίσεις | `lib/entry-filters.ts`, `components/EntryListFilters.tsx`, `lib/service-reminders.ts`, `components/ServiceReminderBanner.tsx` |
| Offline | `lib/offline-create.ts`, `lib/offline-network.ts`, `lib/offline-queue.ts`, `lib/offline-sync.ts`, `components/OfflineProvider.tsx`, `public/sw.js` |
| Layout / styling | `app/layout.tsx`, `app/globals.css`, `components/AppShell.tsx`, `components/PageMain.tsx`, `components/FormShell.tsx`, `components/FormActionBar.tsx` |
| Tests | `lib/*.test.ts`, `vitest.config.ts` |

## Συμβόλαια που πρέπει να διατηρούνται

### Storage και cache

Το `SHEET_SCHEMAS` στο `lib/sheets.ts` ορίζει ονόματα και σειρά στηλών για
`fuel_entries`, `service_entries`, `expense_entries`, `vehicle_profile`.
Οι serializers πρέπει να συμφωνούν με αυτή τη σειρά. Το storage helper
δημιουργεί tabs/headers όταν χρειάζεται· ακόμη και ανάγνωση μπορεί να εκκινήσει
αυτή τη διαδικασία. Μην χρησιμοποιείς πραγματικό Sheet για δοκιμές χωρίς λόγο.

Το `next.config.ts` ενεργοποιεί `cacheComponents`. Το `getCachedRows` χρησιμοποιεί
`"use cache"`, `cacheLife("minutes")` και tag `sheet:<tab>`. Τα mutation routes
καλούν `revalidateTag(..., "max")` και `revalidatePath` για τις σχετικές σελίδες.
Μην υποθέτεις ότι κάθε ανάγνωση είναι uncached ή ότι η ανανέωση είναι πάντα άμεση.

### Auth και Google

Το `proxy.ts` κάνει redirects για προστατευμένες σελίδες, εξαιρώντας τα APIs.
Τα APIs εφαρμόζουν `requireSession` / `requireWritableSession`: 401 χωρίς
session, 403 για demo writes. Τα data loaders δεν αποτελούν ανεξάρτητο auth guard.

Το `lib/app-session.ts` παρέχει κοινό session για σελίδες και API guards.
Μόνο σε `NODE_ENV=development`, το `AUTH_BYPASS=true` επιτρέπει προσωρινή
τοπική πρόσβαση χωρίς login, με εγγραφές στο πραγματικό Sheet. Το proxy
χρησιμοποιεί τον ίδιο διακόπτη. Δεν δημιουργείται Google OAuth token.

Sheets και Calendar χρησιμοποιούν service-account credentials. Τα receipt
uploads χρησιμοποιούν το OAuth token του συνδεδεμένου Google χρήστη μέσω
`lib/auth-server.ts` και `getUserDriveClient`. Το `auth.ts` χειρίζεται JWT
sessions και ανανέωση OAuth token· τα tokens δεν εκτίθενται στο client session.
Οι μεταβλητές περιβάλλοντος και το setup περιγράφονται στο [README](../README.md).

### Υπολογισμοί

Η τιμή καυσίμου ανά λίτρο προκύπτει από `total_cost / liters` με τρία δεκαδικά.
Τα σύνολα κόστους και λίτρων περιλαμβάνουν κάθε καταχώρηση, ανεξάρτητα από το
`is_full_tank`. Η εφαρμογή δεν εμφανίζει εκτίμηση κατανάλωσης από διαδοχικά
γεμίσματα, επειδή αυτό δεν αποτελεί αξιόπιστη μέτρηση χωρίς πλήρεις κύκλους
γεμίσματος. Δες `lib/fuel-calculations.test.ts` πριν αλλάξεις αυτά τα μεγέθη.

## Υπάρχοντες περιορισμοί

- Όλοι οι non-demo χρήστες χρησιμοποιούν το ίδιο `GOOGLE_SHEET_ID`.
  Δεν υπάρχει per-user ownership ή επιλογή πολλών οχημάτων.
- Offline queue υπάρχει για νέες εγγραφές, όχι γενικό offline CRUD.
  Τα queued payloads δεν έχουν server idempotency key: retry μετά από μερική
  επιτυχία μπορεί να δημιουργήσει διπλή εγγραφή, ειδικά σε αποτυχία απόδειξης.
- Τα Sheets writes δεν είναι συναλλαγές βάσης δεδομένων· μη θεωρείς ταυτόχρονες
  εγγραφές ή read-modify-write ατομικές.
- Οι αποδείξεις αφορούν καύσιμα. Τα fuel Calendar events είναι προαιρετικά·
  αποτυχία του Calendar δεν ακυρώνει την αποθηκευμένη εγγραφή καυσίμων.
- Τα υπάρχοντα tests καλύπτουν helpers σε Node, όχι ολοκληρωμένα browser ή
  Google integration σενάρια.

Αυτά περιγράφουν την τρέχουσα υλοποίηση, όχι υποχρεωτικές μελλοντικές επιλογές.
