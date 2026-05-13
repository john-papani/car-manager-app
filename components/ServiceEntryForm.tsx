"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServiceEntry } from "@/services/serviceService";

export default function ServiceEntryForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    odometer: "",
    total_cost: "",
    service_type: "",
    location: "",
    next_service_odometer: "",
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
      await createServiceEntry({
        date: form.date,
        odometer: Number(form.odometer),
        total_cost: form.total_cost ? Number(form.total_cost) : 0,
        service_type: form.service_type,
        location: form.location,
        next_service_odometer: form.next_service_odometer
          ? Number(form.next_service_odometer)
          : undefined,
        notes: form.notes,
      });

      router.push("/service");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Η αποθήκευση του service απέτυχε.");
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
            Είδος service
          </label>
          <input
            type="text"
            value={form.service_type}
            onChange={(event) => updateField("service_type", event.target.value)}
            placeholder="π.χ. Αλλαγή λαδιών"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Χιλιόμετρα
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.odometer}
              onChange={(event) => updateField("odometer", event.target.value)}
              placeholder="185420"
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
              placeholder="120.00"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Συνεργείο
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="π.χ. Auto Service Νίκος"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Επόμενο service στα km
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={form.next_service_odometer}
            onChange={(event) =>
              updateField("next_service_odometer", event.target.value)
            }
            placeholder="195000"
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
            placeholder="π.χ. μαζί με φίλτρο λαδιού και έλεγχο φρένων"
            rows={3}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="sticky bottom-20 mt-6 flex justify-end bg-[linear-gradient(180deg,rgba(246,240,230,0)_0%,rgba(246,240,230,0.92)_38%,rgba(246,240,230,1)_100%)] px-1 pb-1 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-36 items-center justify-center rounded-full border border-[rgb(18_49_59_/_0.08)] bg-[rgb(255_251_246_/_0.92)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgb(18_49_59_/_0.08)] transition hover:border-[rgb(18_49_59_/_0.14)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση service"}
        </button>
      </div>
    </form>
  );
}
