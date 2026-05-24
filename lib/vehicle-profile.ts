import type { VehicleProfile } from "@/types/car";

function parseSheetNumber(value: string) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function mapRowToVehicleProfile(
  row: Record<string, string>,
): VehicleProfile {
  const year = parseSheetNumber(row.year);

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    trim: row.trim,
    year: year || undefined,
    license_plate: row.license_plate,
    fuel_type: row.fuel_type,
    transmission: row.transmission,
    engine: row.engine,
    color: row.color,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function isVehicleProfileValid(profile: VehicleProfile) {
  return Boolean(profile.id) && Boolean(profile.make) && Boolean(profile.model);
}
