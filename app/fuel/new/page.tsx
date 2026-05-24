import { Suspense } from "react";
import FuelEntryForm from "@/components/FuelEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";

export default function NewFuelEntryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-12">
      <EntryPageHeader
        eyebrow="Καύσιμα"
        title="Νέο γέμισμα"
        description="Πέρασε το γέμισμα σε λίγα δευτερόλεπτα και κράτα το ιστορικό σου καθαρό, έτοιμο για στατιστικά."
        backHref="/fuel"
        backLabel="Ιστορικό"
        accentLabel="Quick entry"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <FuelEntryForm />
        </Suspense>
      </div>
    </main>
  );
}
