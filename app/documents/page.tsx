import { Suspense } from "react";
import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import DataLoadError from "@/components/DataLoadError";
import VehicleDocumentManager from "@/components/VehicleDocumentManager";
import { getCurrentVehicleDocuments } from "@/lib/current-user-data";
import type { VehicleDocument } from "@/types/car";

async function DocumentsContent() {
  const session = await auth();
  let entries: VehicleDocument[] = [];
  let loadFailed = false;

  try {
    entries = await getCurrentVehicleDocuments(session);
  } catch (error) {
    console.error("Failed to load vehicle documents", error);
    loadFailed = true;
  }

  return (
    <PageMain>
      <PageHeader
        eyebrow="Όχημα"
        title="Έγγραφα και λήξεις"
        description="Ασφάλεια, ΚΤΕΟ, τέλη κυκλοφορίας και οδική βοήθεια."
      />
      {loadFailed ? (
        <div className="mt-5">
          <DataLoadError />
        </div>
      ) : (
        <VehicleDocumentManager entries={entries} />
      )}
    </PageMain>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DocumentsContent />
    </Suspense>
  );
}
