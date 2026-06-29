export function parseSheetNumber(value: string): number | null {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function parseSheetNumberOrZero(value: string): number {
  return parseSheetNumber(value) ?? 0;
}
