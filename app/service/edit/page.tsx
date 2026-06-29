import { notFound } from "next/navigation";
import { Suspense } from "react";
import EntryPageHeader from "@/components/EntryPageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import ServiceEntryForm from "@/components/ServiceEntryForm";
import { auth } from "@/auth";
import { getCurrentServiceEntries } from "@/lib/current-user-data";

type EditServicePageProps = {
  searchParams: Promise<{ id?: string }>;
};

async function EditServiceContent({ searchParams }: EditServicePageProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const session = await auth();
  const entries = await getCurrentServiceEntries(session);
  const entry = entries.find((item) => item.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <EntryPageHeader
        eyebrow="Service"
        title="Επεξεργασία εργασίας"
        description="Διόρθωσε τα στοιχεία του service."
        backHref="/service"
        backLabel="Ιστορικό"
      />
      <div className="mt-5">
        <ServiceEntryForm initialEntry={entry} />
      </div>
    </>
  );
}

export default function EditServiceEntryPage({
  searchParams,
}: EditServicePageProps) {
  return (
    <PageMain compact>
      <Suspense fallback={<PageSkeleton />}>
        <EditServiceContent searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}
