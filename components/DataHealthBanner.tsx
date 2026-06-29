type DataHealthBannerProps = {
  invalidRowCount: number;
};

export default function DataHealthBanner({
  invalidRowCount,
}: DataHealthBannerProps) {
  if (invalidRowCount <= 0) {
    return null;
  }

  return (
    <div
      role="status"
      className="mt-4 rounded-[1.25rem] border border-[rgb(202_111_61_/_0.24)] bg-[rgb(202_111_61_/_0.08)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]"
    >
      {invalidRowCount === 1
        ? "1 γραμμή στο Google Sheet έχει λάθος δεδομένα και δεν εμφανίζεται."
        : `${invalidRowCount} γραμμές στο Google Sheet έχουν λάθος δεδομένα και δεν εμφανίζονται.`}{" "}
      Έλεγξε το spreadsheet για κενά ή μη έγκυρα νούμερα.
    </div>
  );
}
