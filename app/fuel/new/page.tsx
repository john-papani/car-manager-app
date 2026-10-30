import { Suspense } from "react";
import FuelEntryForm from "@/components/FuelEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";
import PageMain from "@/components/PageMain";
import { getCurrentFuelEntries } from "@/lib/current-user-data";

async function FuelEntryFormWithSuggestions() {
  const entries = await getCurrentFuelEntries();
  const suggestedEntry = entries.reduce(
    (latest, entry) =>
      !latest || entry.odometer > latest.odometer ? entry : latest,
    entries[0],
  );

  return <FuelEntryForm suggestedEntry={suggestedEntry} />;
}

export default function NewFuelEntryPage() {
  return (
    <PageMain compact>
      <EntryPageHeader
        eyebrow="Καύσιμα"
        title="Νέο γέμισμα"
        description="Συμπλήρωσε ημερομηνία, χιλιόμετρα, λίτρα και κόστος."
        backHref="/fuel"
        backLabel="Ιστορικό"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <FuelEntryFormWithSuggestions />
        </Suspense>
      </div>
    </PageMain>
  );
}
