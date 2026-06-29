import { notFound } from "next/navigation";
import { Suspense } from "react";
import EntryPageHeader from "@/components/EntryPageHeader";
import ExpenseEntryForm from "@/components/ExpenseEntryForm";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { auth } from "@/auth";
import { getCurrentExpenseEntries } from "@/lib/current-user-data";

type EditExpensePageProps = {
  searchParams: Promise<{ id?: string }>;
};

async function EditExpenseContent({ searchParams }: EditExpensePageProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const session = await auth();
  const entries = await getCurrentExpenseEntries(session);
  const entry = entries.find((item) => item.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <EntryPageHeader
        eyebrow="Έξοδα"
        title="Επεξεργασία εξόδου"
        description="Διόρθωσε τα στοιχεία της καταχώρησης."
        backHref="/expenses"
        backLabel="Ιστορικό"
      />
      <div className="mt-5">
        <ExpenseEntryForm initialEntry={entry} />
      </div>
    </>
  );
}

export default function EditExpenseEntryPage({
  searchParams,
}: EditExpensePageProps) {
  return (
    <PageMain compact>
      <Suspense fallback={<PageSkeleton />}>
        <EditExpenseContent searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}
