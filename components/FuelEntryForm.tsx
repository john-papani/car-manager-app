"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFuelEntry, uploadFuelReceipt } from "@/services/fuelService";
import FormActionBar from "@/components/FormActionBar";

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      let receiptUpload:
        | {
            file_id?: string;
            url?: string;
          }
        | undefined;

      if (receiptFile) {
        receiptUpload = await uploadFuelReceipt(receiptFile);
      }

      await createFuelEntry({
        date: form.date,
        odometer: Number(form.odometer),
        liters: Number(form.liters),
        total_cost: Number(form.total_cost),
        station: form.station,
        is_full_tank: form.is_full_tank,
        notes: form.notes,
        receipt_file_id: receiptUpload?.file_id,
        receipt_url: receiptUpload?.url,
      });

      router.push("/fuel");
      router.refresh();
    } catch (error) {
      console.error(error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Κάτι πήγε λάθος στην αποθήκευση.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--surface-shadow)] backdrop-blur-sm"
    >
      <div className="rounded-[1.5rem] border border-white/65 bg-white/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          Γρήγορη καταχώρηση
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          Συμπλήρωσε πρώτα τα βασικά και άφησε τη φωτογραφία της απόδειξης για το
          τέλος, ώστε η ροή να παραμένει γρήγορη.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card-strong)] p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Ημερομηνία
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Χιλιόμετρα κοντέρ
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={form.odometer}
                onChange={(event) => updateField("odometer", event.target.value)}
                placeholder="185420"
                className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]"
                required
              />
            </div>

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
                placeholder="0.00"
                className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]"
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
                placeholder="0.00"
                className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Πρατήριο
              </label>
              <input
                type="text"
                value={form.station}
                onChange={(event) => updateField("station", event.target.value)}
                placeholder="Shell, EKO..."
                className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--line)] bg-[var(--card-strong)] p-4 shadow-sm active:bg-[var(--background-strong)]">
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[var(--foreground)]">
              Full tank
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
              Ενεργοποίησέ το μόνο όταν το ρεζερβουάρ γέμισε πλήρως, για καλύτερα
              στατιστικά κατανάλωσης.
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

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card-strong)] p-4 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Φωτογραφία απόδειξης
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptChange}
            className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:text-[var(--accent-strong)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Προαιρετικά, ανέβασε τη φωτογραφία της απόδειξης για να τη βρίσκεις
            αργότερα μαζί με την καταχώρηση.
          </p>
          {receiptFile ? (
            <p className="mt-2 inline-flex rounded-full bg-[var(--accent-soft-strong)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
              Επιλεγμένο αρχείο: {receiptFile.name}
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-2 text-xs font-medium text-[var(--danger,#b42318)]">
              {uploadError}
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card-strong)] p-4">
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Σημειώσεις
          </label>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="π.χ. ταξίδι, πολλή κίνηση, air condition..."
            rows={3}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <FormActionBar
        disabled={isSubmitting}
        isSubmitting={isSubmitting}
        idleLabel="Αποθήκευση γεμίσματος"
        submittingLabel="Αποθήκευση..."
        hint="Έλεγξε λίτρα και κόστος. Όταν είσαι έτοιμος, αποθήκευσε με ένα πάτημα."
      />
    </form>
  );
}
