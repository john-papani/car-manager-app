"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/AppProviders";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import FormActionBar from "@/components/FormActionBar";
import {
  formInputClass,
  formLabelClass,
  formSectionClass,
} from "@/components/FormShell";
import {
  documentTypeLabels,
  getDocumentStatus,
  sortDocumentsByUrgency,
} from "@/lib/document-status";
import {
  createVehicleDocument,
  updateVehicleDocument,
} from "@/services/documentService";
import {
  vehicleDocumentTypes,
  type VehicleDocument,
  type VehicleDocumentType,
} from "@/types/car";

type Props = { entries: VehicleDocument[] };

const emptyForm = {
  document_type: "insurance" as VehicleDocumentType,
  expires_at: "",
  provider: "",
  total_cost: "",
  notes: "",
};

function statusPresentation(entry: VehicleDocument) {
  const result = getDocumentStatus(entry.expires_at);

  if (result.status === "expired") {
    return {
      label: `Έληξε πριν από ${Math.abs(result.daysRemaining)} ημέρες`,
      className: "bg-red-100 text-red-900",
    };
  }

  if (result.status === "expiring") {
    return {
      label:
        result.daysRemaining === 0
          ? "Λήγει σήμερα"
          : `Λήγει σε ${result.daysRemaining} ημέρες`,
      className: "bg-amber-100 text-amber-900",
    };
  }

  return {
    label: "Ενεργό",
    className: "bg-emerald-100 text-emerald-900",
  };
}

export default function VehicleDocumentManager({ entries }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setEditingId(undefined);
    setForm(emptyForm);
    setError("");
  }

  function edit(entry: VehicleDocument) {
    setEditingId(entry.id);
    setForm({
      document_type: entry.document_type,
      expires_at: entry.expires_at,
      provider: entry.provider ?? "",
      total_cost: entry.total_cost === undefined ? "" : String(entry.total_cost),
      notes: entry.notes ?? "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input = {
      document_type: form.document_type,
      expires_at: form.expires_at,
      provider: form.provider,
      total_cost: form.total_cost ? Number(form.total_cost) : undefined,
      notes: form.notes,
    };

    try {
      if (editingId) {
        await updateVehicleDocument({ id: editingId, ...input });
      } else {
        await createVehicleDocument(input);
      }

      showToast(
        editingId ? "Το έγγραφο ενημερώθηκε." : "Το έγγραφο προστέθηκε.",
        "success",
      );
      resetForm();
      startTransition(() => router.refresh());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Η αποθήκευση του εγγράφου απέτυχε.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const sortedEntries = sortDocumentsByUrgency(entries);

  return (
    <>
      <form onSubmit={submit} className="mt-5">
        <div className={formSectionClass}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="document-type" className={formLabelClass}>
                Τύπος εγγράφου
              </label>
              <select
                id="document-type"
                value={form.document_type}
                onChange={(event) =>
                  updateField("document_type", event.target.value)
                }
                className={formInputClass}
              >
                {vehicleDocumentTypes.map((type) => (
                  <option key={type} value={type}>
                    {documentTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="document-expiry" className={formLabelClass}>
                Ημερομηνία λήξης
              </label>
              <input
                id="document-expiry"
                type="date"
                value={form.expires_at}
                onChange={(event) => updateField("expires_at", event.target.value)}
                className={formInputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="document-provider" className={formLabelClass}>
                Εταιρεία ή φορέας
              </label>
              <input
                id="document-provider"
                value={form.provider}
                onChange={(event) => updateField("provider", event.target.value)}
                className={formInputClass}
                placeholder="Προαιρετικό"
              />
            </div>

            <div>
              <label htmlFor="document-cost" className={formLabelClass}>
                Κόστος €
              </label>
              <input
                id="document-cost"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.total_cost}
                onChange={(event) => updateField("total_cost", event.target.value)}
                className={formInputClass}
                placeholder="Προαιρετικό"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="document-notes" className={formLabelClass}>
                Σημειώσεις
              </label>
              <textarea
                id="document-notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className={formInputClass}
                rows={3}
                placeholder="Αριθμός συμβολαίου ή άλλη πληροφορία"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <FormActionBar
            disabled={isSubmitting || isPending}
            isSubmitting={isSubmitting || isPending}
            idleLabel={editingId ? "Αποθήκευση αλλαγών" : "Προσθήκη εγγράφου"}
            submittingLabel="Αποθήκευση..."
          />

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting || isPending}
              className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ακύρωση επεξεργασίας
            </button>
          ) : null}
        </div>
      </form>

      <section className="mt-5 space-y-3" aria-label="Καταχωρημένα έγγραφα">
        {sortedEntries.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[var(--line)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Δεν υπάρχουν έγγραφα
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε το πρώτο για να εμφανίζονται έγκαιρα οι λήξεις.
            </p>
          </div>
        ) : (
          sortedEntries.map((entry) => {
            const status = statusPresentation(entry);

            return (
              <article
                key={entry.id}
                className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      {documentTypeLabels[entry.document_type]}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Λήξη: {entry.expires_at}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {entry.provider || entry.total_cost !== undefined ? (
                  <p className="mt-3 text-sm text-[var(--foreground)]">
                    {[entry.provider, entry.total_cost !== undefined ? `${entry.total_cost.toFixed(2)}€` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}

                {entry.notes ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {entry.notes}
                  </p>
                ) : null}

                <div className="mt-4 flex justify-end gap-2 border-t border-[var(--line)] pt-3">
                  <button
                    type="button"
                    onClick={() => edit(entry)}
                    className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                  >
                    Επεξεργασία
                  </button>
                  <DeleteEntryButton
                    entryId={entry.id}
                    endpoint="/api/documents"
                    confirmMessage="Να διαγραφεί αυτό το έγγραφο;"
                  />
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
