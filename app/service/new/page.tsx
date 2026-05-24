import { Suspense } from "react";
import ServiceEntryForm from "@/components/ServiceEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";

export default function NewServiceEntryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-12">
      <EntryPageHeader
        eyebrow="Service"
        title="Νέα εργασία"
        description="Αποθήκευσε ό,τι έγινε στο αυτοκίνητο και κράτα ξεκάθαρη εικόνα για χιλιόμετρα, κόστος και επόμενο service."
        backHref="/service"
        backLabel="Ιστορικό"
        accentLabel="Maintenance"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <ServiceEntryForm />
        </Suspense>
      </div>
    </main>
  );
}
