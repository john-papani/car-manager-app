type DataLoadErrorProps = {
  message?: string;
};

export default function DataLoadError({
  message = "Δεν ήταν δυνατή η φόρτωση των δεδομένων από το Google Sheet. Έλεγξε τη σύνδεση και τις ρυθμίσεις.",
}: DataLoadErrorProps) {
  return (
    <div
      role="alert"
      className="mt-5 rounded-[1.6rem] border border-[rgb(202_111_61_/_0.24)] bg-[rgb(202_111_61_/_0.08)] p-5 text-sm leading-6 text-[var(--foreground)]"
    >
      <p className="font-semibold">Σφάλμα φόρτωσης</p>
      <p className="mt-2 text-[var(--muted)]">{message}</p>
    </div>
  );
}
