"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVehicleProfile } from "@/services/vehicleService";
import type { VehicleProfile } from "@/types/car";

type VehicleProfileFormProps = {
  initialProfile: VehicleProfile | null;
};

function getInitialForm(profile: VehicleProfile | null) {
  return {
    make: profile?.make || "",
    model: profile?.model || "",
    trim: profile?.trim || "",
    year: profile?.year ? String(profile.year) : "",
    license_plate: profile?.license_plate || "",
    fuel_type: profile?.fuel_type || "",
    transmission: profile?.transmission || "",
    engine: profile?.engine || "",
    color: profile?.color || "",
  };
}

export default function VehicleProfileForm({
  initialProfile,
}: VehicleProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(getInitialForm(initialProfile));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function updateField(name: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFeedback("");

    try {
      await updateVehicleProfile({
        make: form.make,
        model: form.model,
        trim: form.trim,
        year: form.year ? Number(form.year) : undefined,
        license_plate: form.license_plate,
        fuel_type: form.fuel_type,
        transmission: form.transmission,
        engine: form.engine,
        color: form.color,
      });

      setFeedback("Τα στοιχεία του οχήματος αποθηκεύτηκαν.");
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Δεν ήταν δυνατή η αποθήκευση των στοιχείων.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-[1.8rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Στοιχεία οχήματος
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Δες και ενημέρωσε τα βασικά χαρακτηριστικά του αυτοκινήτου σου.
          </p>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
          Όχημα
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Μάρκα
            </label>
            <input
              type="text"
              value={form.make}
              onChange={(event) => updateField("make", event.target.value)}
              placeholder="Ford"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Μοντέλο
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="Puma"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Έκδοση
            </label>
            <input
              type="text"
              value={form.trim}
              onChange={(event) => updateField("trim", event.target.value)}
              placeholder="ST-Line"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Έτος
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              value={form.year}
              onChange={(event) => updateField("year", event.target.value)}
              placeholder="2024"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Πινακίδα
            </label>
            <input
              type="text"
              value={form.license_plate}
              onChange={(event) => updateField("license_plate", event.target.value)}
              placeholder="ΧΧΧ-1234"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base uppercase outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Καύσιμο
            </label>
            <input
              type="text"
              value={form.fuel_type}
              onChange={(event) => updateField("fuel_type", event.target.value)}
              placeholder="Βενζίνη"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Κιβώτιο
            </label>
            <input
              type="text"
              value={form.transmission}
              onChange={(event) => updateField("transmission", event.target.value)}
              placeholder="Manual"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Κινητήρας
            </label>
            <input
              type="text"
              value={form.engine}
              onChange={(event) => updateField("engine", event.target.value)}
              placeholder="1.0 EcoBoost 125hp"
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Χρώμα
          </label>
          <input
            type="text"
            value={form.color}
            onChange={(event) => updateField("color", event.target.value)}
            placeholder="Μπλε"
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--card-strong)] px-4 py-3 text-base outline-none transition focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {feedback ? (
        <p className="mt-4 text-sm font-medium text-[var(--accent-strong)]">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm font-medium text-[var(--danger,#b42318)]">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[1.15rem] bg-[var(--navy)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_34px_rgb(18_49_59_/_0.2)] transition hover:bg-[rgb(16_43_52_/_0.96)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση στοιχείων"}
        </button>
      </div>
    </form>
  );
}
