import { Suspense } from "react";
import FuelEntryForm from "@/components/FuelEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";
import PageMain from "@/components/PageMain";

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
          <FuelEntryForm />
        </Suspense>
      </div>
    </PageMain>
  );
}
