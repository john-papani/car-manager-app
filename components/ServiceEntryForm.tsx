"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createServiceEntry, updateServiceEntry } from "@/services/serviceService";
import { useToast } from "@/components/AppProviders";
import FormActionBar from "@/components/FormActionBar";
import FormShell from "@/components/FormShell";
import type { ServiceEntry } from "@/types/car";

type ServiceEntryFormProps = {
  initialEntry?: ServiceEntry;
};

export default function ServiceEntryForm({ initialEntry }: ServiceEntryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    date: initialEntry?.date ?? new Date().toISOString().slice(0, 10),
    odometer: initialEntry ? String(initialEntry.odometer) : "",
    total_cost: initialEntry ? String(initialEntry.total_cost) : "",
    service_type: initialEntry?.service_type ?? "",
    location: initialEntry?.location ?? "",
    next_service_odometer: initialEntry?.next_service_odometer
      ? String(initialEntry.next_service_odometer)
      : "",
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
        odometer: Number(form.odometer),
        total_cost: form.total_cost ? Number(form.total_cost) : 0,
        service_type: form.service_type,
        location: form.location,
        next_service_odometer: form.next_service_odometer
          ? Number(form.next_service_odometer)
          : undefined,
        notes: form.notes,
      };

      if (initialEntry) {
        await updateServiceEntry({ id: initialEntry.id, ...payload });
      } else {
        await createServiceEntry(payload);
      }

      startTransition(() => {
        router.replace("/service");
        router.refresh();
      });
      showToast("Το service αποθηκεύτηκε.", "success");
    } catch (error) {
      console.error(error);
      setSubmitError("Η αποθήκευση του service δεν ολοκληρώθηκε.");
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

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Είδος service
              </label>
              <input
                type="text"
                value={form.service_type}
                onChange={(event) => updateField("service_type", event.target.value)}
                placeholder="π.χ. Αλλαγή λαδιών"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
                required
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
                placeholder="185420"
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
                placeholder="120.00"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card-strong)] p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Συνεργείο
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="π.χ. Auto Service Νίκος"
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
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
                placeholder="π.χ. μαζί με φίλτρο λαδιού και έλεγχο φρένων"
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
        idleLabel={initialEntry ? "Αποθήκευση αλλαγών" : "Αποθήκευση service"}
        submittingLabel={isPending ? "Μετάβαση..." : "Αποθήκευση..."}
      />
      </FormShell>
    </form>
  );
}
