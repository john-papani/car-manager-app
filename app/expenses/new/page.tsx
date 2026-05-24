import { Suspense } from "react";
import ExpenseEntryForm from "@/components/ExpenseEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";

export default function NewExpenseEntryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-12">
      <EntryPageHeader
        eyebrow="Έξοδα"
        title="Νέο έξοδο"
        description="Κατέγραψε οποιοδήποτε έξοδο του οχήματος γρήγορα, ώστε το συνολικό κόστος να μένει πάντα υπό έλεγχο."
        backHref="/expenses"
        backLabel="Ιστορικό"
        accentLabel="Cost log"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <ExpenseEntryForm />
        </Suspense>
      </div>
    </main>
  );
}
