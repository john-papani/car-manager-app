"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  attachFuelReceipt,
  createFuelEntry,
  updateFuelEntry,
  uploadFuelReceipt,
} from "@/services/fuelService";
import { useToast } from "@/components/AppProviders";
import { getOfflineSuccessMessage } from "@/lib/offline-create";
import { compressReceiptImage } from "@/lib/compress-image";
import {
  notifyFuelReceiptAttached,
  setFuelSaveFeedback,
} from "@/lib/fuel-save-feedback";
import FormActionBar from "@/components/FormActionBar";
import FormShell, {
  formInputClass,
  formLabelClass,
  formSectionClass,
} from "@/components/FormShell";
import type { FuelEntry } from "@/types/car";

type FuelEntryFormProps = {
  initialEntry?: FuelEntry;
};

export default function FuelEntryForm({ initialEntry }: FuelEntryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    date: initialEntry?.date ?? new Date().toISOString().slice(0, 10),
    odometer: initialEntry ? String(initialEntry.odometer) : "",
    liters: initialEntry ? String(initialEntry.liters) : "",
    total_cost: initialEntry ? String(initialEntry.total_cost) : "",
    station: initialEntry?.station ?? "",
    is_full_tank: initialEntry?.is_full_tank ?? true,
    notes: initialEntry?.notes ?? "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePreview = useMemo(() => {
    const liters = parseFloat(form.liters);
    const totalCost = parseFloat(form.total_cost);

    if (!Number.isFinite(liters) || liters <= 0 || !Number.isFinite(totalCost)) {
      return null;
    }

    return (totalCost / liters).toFixed(3);
  }, [form.liters, form.total_cost]);

  const normalizeDecimalInput = (value: string) => {
    return value
      .replace(",", ".")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
  };

  function updateField(name: string, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setUploadError("");

    if (!nextFile) {
      setReceiptFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setReceiptFile(null);
      setUploadError("Επίλεξε φωτογραφία απόδειξης.");
      event.target.value = "";
      return;
    }

    setReceiptFile(nextFile);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setUploadError("");

    const liters = parseFloat(form.liters);
    const totalCost = parseFloat(form.total_cost);
    const receiptToUpload = receiptFile;

    try {
      const payload = {
        date: form.date,
        odometer: Number(form.odometer),
        liters,
        total_cost: totalCost,
        station: form.station,
        is_full_tank: form.is_full_tank,
        notes: form.notes,
      };

      const createResult = initialEntry
        ? {
            entry: (
              await updateFuelEntry({ id: initialEntry.id, ...payload })
            ).entry,
            queued: false,
          }
        : await createFuelEntry(payload, { receiptFile: receiptToUpload });

      const { entry, queued } = createResult;

      if (!queued) {
        setFuelSaveFeedback({
          entryId: entry.id,
          pendingReceipt: Boolean(receiptToUpload),
          savedAt: Date.now(),
        });
      }

      showToast(
        getOfflineSuccessMessage(queued, "Το γέμισμα αποθηκεύτηκε."),
        queued ? "info" : "success",
      );

      startTransition(() => {
        router.replace("/fuel");
        router.refresh();
      });

      if (receiptToUpload && !initialEntry && !queued) {
        void (async () => {
          try {
            const compressed = await compressReceiptImage(receiptToUpload);
            const receiptUpload = await uploadFuelReceipt(compressed);
            await attachFuelReceipt(entry.id, receiptUpload);
            notifyFuelReceiptAttached(entry.id);
          } catch (error) {
            console.error("Background receipt upload failed:", error);
          }
        })();
      }
    } catch (error) {
      console.error(error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Κάτι πήγε λάθος στην αποθήκευση.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormShell>
      <div className="space-y-4">
        <div className={formSectionClass}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={formLabelClass}>Ημερομηνία</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={formInputClass}
                required
              />
            </div>

            <div className="col-span-2">
              <label className={formLabelClass}>Χιλιόμετρα κοντέρ</label>
              <input
                type="number"
                inputMode="numeric"
                value={form.odometer}
                onChange={(event) => updateField("odometer", event.target.value)}
                placeholder="185420"
                className={formInputClass}
                required
              />
            </div>

            <div>
              <label className={formLabelClass}>Λίτρα</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.liters}
                onChange={(event) =>
                  updateField("liters", normalizeDecimalInput(event.target.value))
                }
                placeholder="0.00"
                className={formInputClass}
                required
              />
            </div>

            <div>
              <label className={formLabelClass}>Κόστος €</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.total_cost}
                onChange={(event) =>
                  updateField(
                    "total_cost",
                    normalizeDecimalInput(event.target.value),
                  )
                }
                placeholder="0.00"
                className={formInputClass}
                required
              />
            </div>

            <div className="col-span-2">
              <label className={formLabelClass}>Πρατήριο</label>
              <input
                type="text"
                value={form.station}
                onChange={(event) => updateField("station", event.target.value)}
                placeholder="Shell, EKO..."
                className={formInputClass}
              />
            </div>

            {pricePreview ? (
              <div className="col-span-2 rounded-[1.1rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/50 px-4 py-3 text-sm">
                <span className="text-[var(--muted)]">Τιμή ανά λίτρο: </span>
                <span className="font-bold text-[var(--accent-strong)]">
                  {pricePreview} €/L
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <label className={`flex items-center justify-between gap-4 ${formSectionClass} active:bg-[var(--background-strong)]`}>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[var(--foreground)]">
              Πλήρες ρεζερβουάρ
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
              Ενεργό μόνο όταν γέμισες πλήρως — για ακριβή στατιστικά.
            </span>
          </span>

          <input
            type="checkbox"
            checked={form.is_full_tank}
            onChange={(event) =>
              updateField("is_full_tank", event.target.checked)
            }
            className="h-6 w-6 shrink-0 rounded-full accent-[var(--accent)]"
          />
        </label>

        <div className={formSectionClass}>
          <label className={formLabelClass}>Φωτογραφία απόδειξης</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptChange}
            className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:text-[var(--accent-strong)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Προαιρετικό — ανεβαίνει στο background μετά την αποθήκευση.
          </p>
          {receiptFile ? (
            <p className="mt-2 inline-flex rounded-full bg-[var(--accent-soft-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
              {receiptFile.name}
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-2 text-xs font-medium text-[var(--danger,#b42318)]">
              {uploadError}
            </p>
          ) : null}
        </div>

        <div className={formSectionClass}>
          <label className={formLabelClass}>Σημειώσεις</label>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="π.χ. ταξίδι, κίνηση..."
            rows={3}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <FormActionBar
        disabled={isSubmitting || isPending}
        isSubmitting={isSubmitting || isPending}
        idleLabel={initialEntry ? "Αποθήκευση αλλαγών" : "Αποθήκευση γεμίσματος"}
        submittingLabel={isPending ? "Μετάβαση..." : "Αποθήκευση..."}
      />
      </FormShell>
    </form>
  );
}
