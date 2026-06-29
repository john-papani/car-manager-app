import type { VehicleProfile } from "@/types/car";
import { parseSheetNumberOrZero } from "@/lib/sheet-parse";

export function mapRowToVehicleProfile(
  row: Record<string, string>,
): VehicleProfile {
  const year = parseSheetNumberOrZero(row.year);

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
