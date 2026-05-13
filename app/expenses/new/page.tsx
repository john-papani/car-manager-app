import ExpenseEntryForm from "@/components/ExpenseEntryForm";

export default function NewExpenseEntryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-32">
      <div className="mb-6 rounded-[1.9rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
          Έξοδα
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Νέο έξοδο
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/72">
          Καταχώρησε ασφάλεια, διόδια, parking ή οποιοδήποτε άλλο σταθερό ή
          έκτακτο κόστος.
        </p>
      </div>

      <ExpenseEntryForm />
    </main>
  );
}
