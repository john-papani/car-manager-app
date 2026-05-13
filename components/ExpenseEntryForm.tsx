"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpenseEntry } from "@/services/expenseService";

export default function ExpenseEntryForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "",
    total_cost: "",
    odometer: "",
    vendor: "",
    notes: "",
  });
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

    try {
      await createExpenseEntry({
        date: form.date,
        category: form.category,
        total_cost: Number(form.total_cost),
        odometer: form.odometer ? Number(form.odometer) : undefined,
        vendor: form.vendor,
        notes: form.notes,
      });

      router.push("/expenses");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Η αποθήκευση του εξόδου απέτυχε.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
    >
      <div className="space-y-4 pb-20">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Ημερομηνία
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Κατηγορία
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="π.χ. Ασφάλεια"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
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
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Προμηθευτής / σημείο
          </label>
          <input
            type="text"
            value={form.vendor}
            onChange={(event) => updateField("vendor", event.target.value)}
            placeholder="π.χ. e-Pass, Δημοτικό Parking"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
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
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
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
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="sticky bottom-20 mt-6 flex justify-end bg-[linear-gradient(180deg,rgba(246,240,230,0)_0%,rgba(246,240,230,0.92)_38%,rgba(246,240,230,1)_100%)] px-1 pb-1 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-36 items-center justify-center rounded-full border border-[rgb(18_49_59_/_0.14)] bg-[rgb(255_251_246_/_0.96)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_14px_30px_rgb(18_49_59_/_0.12),inset_0_1px_0_rgb(255_255_255_/_0.72)] transition hover:border-[rgb(18_49_59_/_0.2)] hover:bg-white hover:shadow-[0_18px_34px_rgb(18_49_59_/_0.14),inset_0_1px_0_rgb(255_255_255_/_0.8)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση εξόδου"}
        </button>
      </div>
    </form>
  );
}
