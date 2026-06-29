import { notFound } from "next/navigation";
import { Suspense } from "react";
import EntryPageHeader from "@/components/EntryPageHeader";
import FuelEntryForm from "@/components/FuelEntryForm";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { auth } from "@/auth";
import { getCurrentFuelEntries } from "@/lib/current-user-data";

type EditFuelPageProps = {
  searchParams: Promise<{ id?: string }>;
};

async function EditFuelContent({ searchParams }: EditFuelPageProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const session = await auth();
  const entries = await getCurrentFuelEntries(session);
  const entry = entries.find((item) => item.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <EntryPageHeader
        eyebrow="Καύσιμα"
        title="Επεξεργασία γεμίσματος"
        description="Διόρθωσε τα στοιχεία της καταχώρησης."
        backHref="/fuel"
        backLabel="Ιστορικό"
      />
      <div className="mt-5">
        <FuelEntryForm initialEntry={entry} />
      </div>
    </>
  );
}

export default function EditFuelEntryPage({ searchParams }: EditFuelPageProps) {
  return (
    <PageMain compact>
      <Suspense fallback={<PageSkeleton />}>
        <EditFuelContent searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}
