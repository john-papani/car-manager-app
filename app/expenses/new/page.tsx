import { Suspense } from "react";
import ExpenseEntryForm from "@/components/ExpenseEntryForm";
import EntryPageHeader from "@/components/EntryPageHeader";
import PageMain from "@/components/PageMain";

export default function NewExpenseEntryPage() {
  return (
    <PageMain compact>
      <EntryPageHeader
        eyebrow="Έξοδα"
        title="Νέο έξοδο"
        description="Κατηγορία, ποσό και ημερομηνία — γρήγορα και καθαρά."
        backHref="/expenses"
        backLabel="Ιστορικό"
      />

      <div className="mt-5">
        <Suspense fallback={null}>
          <ExpenseEntryForm />
        </Suspense>
      </div>
    </PageMain>
  );
}
