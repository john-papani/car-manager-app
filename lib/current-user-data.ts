import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isDemoSession } from "@/lib/demo-mode";
import { getCachedRows } from "@/lib/sheets";
import { isExpenseEntryValid, mapRowToExpenseEntry } from "@/lib/expense-entry";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import { demoExpenseEntries, demoFuelEntries, demoServiceEntries, demoVehicleProfile } from "@/lib/mock-data";
import { isServiceEntryValid, mapRowToServiceEntry } from "@/lib/service-entry";
import {
  isVehicleProfileValid,
  mapRowToVehicleProfile,
} from "@/lib/vehicle-profile";
import type { ExpenseEntry, FuelEntry, ServiceEntry, VehicleProfile } from "@/types/car";

async function resolveSession(session?: Session | null) {
  return session === undefined ? auth() : session;
}

export async function getCurrentFuelEntries(session?: Session | null): Promise<FuelEntry[]> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return demoFuelEntries;
  }

  const rows = await getCachedRows("fuel_entries");

  return rows.map(mapRowToFuelEntry).filter(isFuelEntryValid);
}

export async function getCurrentServiceEntries(
  session?: Session | null,
): Promise<ServiceEntry[]> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return demoServiceEntries;
  }

  const rows = await getCachedRows("service_entries");

  return rows.map(mapRowToServiceEntry).filter(isServiceEntryValid);
}

export async function getCurrentExpenseEntries(
  session?: Session | null,
): Promise<ExpenseEntry[]> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return demoExpenseEntries;
  }

  const rows = await getCachedRows("expense_entries");

  return rows.map(mapRowToExpenseEntry).filter(isExpenseEntryValid);
}

export async function getCurrentVehicleProfile(
  session?: Session | null,
): Promise<VehicleProfile | null> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return demoVehicleProfile;
  }

  const rows = await getCachedRows("vehicle_profile");

  return (
    rows
      .map(mapRowToVehicleProfile)
      .filter(isVehicleProfileValid)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null
  );
}
