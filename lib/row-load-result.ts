export type RowLoadResult<T> = {
  entries: T[];
  invalidRowCount: number;
};

export function loadMappedRows<T>(
  rows: Record<string, string>[],
  mapRow: (row: Record<string, string>) => T,
  isValid: (entry: T, row: Record<string, string>) => boolean,
): RowLoadResult<T> {
  let invalidRowCount = 0;
  const entries: T[] = [];

  for (const row of rows) {
    const hasContent = Object.values(row).some(
      (value) => String(value ?? "").trim() !== "",
    );

    if (!hasContent) {
      continue;
    }

    const mapped = mapRow(row);

    if (isValid(mapped, row)) {
      entries.push(mapped);
    } else if (String(row.id ?? "").trim()) {
      invalidRowCount += 1;
    }
  }

  return { entries, invalidRowCount };
}
