"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFuelEntry } from "@/services/fuelService";

export default function FuelEntryForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: "",
    liters: "",
    total_cost: "",
    station: "",
    is_full_tank: true,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: string, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createFuelEntry({
        date: form.date,
        odometer: Number(form.odometer),
        liters: Number(form.liters),
        total_cost: Number(form.total_cost),
        station: form.station,
        is_full_tank: form.is_full_tank,
        notes: form.notes,
      });

      router.push("/fuel");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Κάτι πήγε λάθος στην αποθήκευση.");
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Χιλιόμετρα κοντέρ
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={form.odometer}
            onChange={(event) => updateField("odometer", event.target.value)}
            placeholder="π.χ. 185420"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Λίτρα
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.liters}
              onChange={(event) => updateField("liters", event.target.value)}
              placeholder="42.5"
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
              placeholder="75.00"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Πρατήριο
          </label>
          <input
            type="text"
            value={form.station}
            onChange={(event) => updateField("station", event.target.value)}
            placeholder="π.χ. Shell, EKO, BP"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        <label className="flex items-center justify-between rounded-[1.35rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-[var(--foreground)]">
              Full tank
            </span>
            <span className="block text-xs text-[var(--muted)]">
              Χρήσιμο για σωστή κατανάλωση
            </span>
          </span>

          <input
            type="checkbox"
            checked={form.is_full_tank}
            onChange={(event) =>
              updateField("is_full_tank", event.target.checked)
            }
            className="h-5 w-5 accent-[var(--accent)]"
          />
        </label>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Σημειώσεις
          </label>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="π.χ. πολλή κίνηση, ταξίδι, air condition..."
            rows={3}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="sticky bottom-20 mt-6 flex justify-end bg-[linear-gradient(180deg,rgba(246,240,230,0)_0%,rgba(246,240,230,0.92)_38%,rgba(246,240,230,1)_100%)] px-1 pb-1 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-[rgb(18_49_59_/_0.08)] bg-[rgb(255_251_246_/_0.92)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgb(18_49_59_/_0.08)] transition hover:border-[rgb(18_49_59_/_0.14)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση γεμίσματος"}
        </button>
      </div>
    </form>
  );
}
