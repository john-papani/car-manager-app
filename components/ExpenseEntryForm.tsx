"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseEntry, updateExpenseEntry } from "@/services/expenseService";
import { useToast } from "@/components/AppProviders";
import FormActionBar from "@/components/FormActionBar";
import FormShell from "@/components/FormShell";
import type { ExpenseEntry } from "@/types/car";

type ExpenseEntryFormProps = {
  initialEntry?: ExpenseEntry;
};

export default function ExpenseEntryForm({ initialEntry }: ExpenseEntryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    date: initialEntry?.date ?? new Date().toISOString().slice(0, 10),
    category: initialEntry?.category ?? "",
    total_cost: initialEntry ? String(initialEntry.total_cost) : "",
    odometer: initialEntry?.odometer ? String(initialEntry.odometer) : "",
    vendor: initialEntry?.vendor ?? "",
    notes: initialEntry?.notes ?? "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        date: form.date,
        category: form.category,
        total_cost: Number(form.total_cost),
        odometer: form.odometer ? Number(form.odometer) : undefined,
        vendor: form.vendor,
        notes: form.notes,
      };

      if (initialEntry) {
        await updateExpenseEntry({ id: initialEntry.id, ...payload });
      } else {
        await createExpenseEntry(payload);
      }

      startTransition(() => {
        router.replace("/expenses");
        router.refresh();
      });
      showToast("Το έξοδο αποθηκεύτηκε.", "success");
    } catch (error) {
      console.error(error);
      setSubmitError("Η αποθήκευση του εξόδου δεν ολοκληρώθηκε.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormShell>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card-strong)] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Ημερομηνία
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Κατηγορία
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="π.χ. Ασφάλεια"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Κόστος €
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={form.total_cost}
                onChange={(event) => updateField("total_cost", event.target.value)}
                placeholder="85.00"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card-strong)] p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Προμηθευτής / σημείο
              </label>
              <input
                type="text"
                value={form.vendor}
                onChange={(event) => updateField("vendor", event.target.value)}
                placeholder="π.χ. e-Pass, Δημοτικό Parking"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Χιλιόμετρα
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={form.odometer}
                onChange={(event) => updateField("odometer", event.target.value)}
                placeholder="προαιρετικό"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Σημειώσεις
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="π.χ. ετήσια ανανέωση ασφάλειας"
                rows={3}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      </div>

      {submitError ? (
        <p className="mt-4 text-sm font-medium text-[var(--danger,#b42318)]">
          {submitError}
        </p>
      ) : null}

      <FormActionBar
        disabled={isSubmitting || isPending}
        isSubmitting={isSubmitting || isPending}
        idleLabel={initialEntry ? "Αποθήκευση αλλαγών" : "Αποθήκευση εξόδου"}
        submittingLabel={isPending ? "Μετάβαση..." : "Αποθήκευση..."}
      />
      </FormShell>
    </form>
  );
}
