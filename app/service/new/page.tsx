import { Suspense } from "react";
import ServiceEntryForm from "@/components/ServiceEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";
import PageMain from "@/components/PageMain";

export default function NewServiceEntryPage() {
  return (
    <PageMain compact>
      <EntryPageHeader
        eyebrow="Συντήρηση"
        title="Νέα εργασία"
        description="Κατέγραψε την εργασία, το κόστος και τα χιλιόμετρα."
        backHref="/service"
        backLabel="Ιστορικό"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <ServiceEntryForm />
        </Suspense>
      </div>
    </PageMain>
  );
}
