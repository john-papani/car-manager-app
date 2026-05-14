"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFuelEntry, uploadFuelReceipt } from "@/services/fuelService";

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
          : "Κάτι πήγε λάθος στην αποθήκευση."
      );
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
            Φωτογραφία απόδειξης
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptChange}
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--accent-strong)] focus:border-[var(--accent)]"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Προαιρετικά, ανέβασε τη φωτογραφία της απόδειξης στο Google Drive.
          </p>
          {receiptFile ? (
            <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
              Επιλεγμένο αρχείο: {receiptFile.name}
            </p>
          ) : null}
          {uploadError ? (
            <p className="mt-2 text-xs font-medium text-[var(--danger,#b42318)]">
              {uploadError}
            </p>
          ) : null}
        </div>

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
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-[rgb(18_49_59_/_0.14)] bg-[rgb(255_251_246_/_0.96)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_14px_30px_rgb(18_49_59_/_0.12),inset_0_1px_0_rgb(255_255_255_/_0.72)] transition hover:border-[rgb(18_49_59_/_0.2)] hover:bg-white hover:shadow-[0_18px_34px_rgb(18_49_59_/_0.14),inset_0_1px_0_rgb(255_255_255_/_0.8)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση γεμίσματος"}
        </button>
      </div>
    </form>
  );
}
