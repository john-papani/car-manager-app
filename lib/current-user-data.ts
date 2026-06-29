import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isDemoSession } from "@/lib/demo-mode";
import { getCachedRows } from "@/lib/sheets";
import { isExpenseEntryValid, mapRowToExpenseEntry } from "@/lib/expense-entry";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import {
  demoExpenseEntries,
  demoFuelEntries,
  demoServiceEntries,
  demoVehicleProfile,
} from "@/lib/mock-data";
import { loadMappedRows, type RowLoadResult } from "@/lib/row-load-result";
import { isServiceEntryValid, mapRowToServiceEntry } from "@/lib/service-entry";
import {
  isVehicleProfileValid,
  mapRowToVehicleProfile,
} from "@/lib/vehicle-profile";
import type {
  ExpenseEntry,
  FuelEntry,
  ServiceEntry,
  VehicleProfile,
} from "@/types/car";

export type DataLoadHealth = {
  invalidRowCount: number;
};

async function resolveSession(session?: Session | null) {
  return session === undefined ? auth() : session;
}

function emptyHealth(): DataLoadHealth {
  return { invalidRowCount: 0 };
}

export async function getCurrentFuelEntriesWithHealth(
  session?: Session | null,
): Promise<RowLoadResult<FuelEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return { entries: demoFuelEntries, invalidRowCount: 0 };
  }

  const rows = await getCachedRows("fuel_entries");
  const result = loadMappedRows(rows, mapRowToFuelEntry, (entry) =>
    isFuelEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentFuelEntries(
  session?: Session | null,
): Promise<FuelEntry[]> {
  const { entries } = await getCurrentFuelEntriesWithHealth(session);
  return entries;
}

export async function getCurrentServiceEntriesWithHealth(
  session?: Session | null,
): Promise<RowLoadResult<ServiceEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return { entries: demoServiceEntries, invalidRowCount: 0 };
  }

  const rows = await getCachedRows("service_entries");
  const result = loadMappedRows(rows, mapRowToServiceEntry, (entry) =>
    isServiceEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentServiceEntries(
  session?: Session | null,
): Promise<ServiceEntry[]> {
  const { entries } = await getCurrentServiceEntriesWithHealth(session);
  return entries;
}

export async function getCurrentExpenseEntriesWithHealth(
  session?: Session | null,
): Promise<RowLoadResult<ExpenseEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  if (isDemoSession(resolvedSession)) {
    return { entries: demoExpenseEntries, invalidRowCount: 0 };
  }

  const rows = await getCachedRows("expense_entries");
  const result = loadMappedRows(rows, mapRowToExpenseEntry, (entry) =>
    isExpenseEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentExpenseEntries(
  session?: Session | null,
): Promise<ExpenseEntry[]> {
  const { entries } = await getCurrentExpenseEntriesWithHealth(session);
  return entries;
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

export async function getDataHealthSummary(session?: Session | null) {
  const [fuel, service, expenses] = await Promise.all([
    getCurrentFuelEntriesWithHealth(session),
    getCurrentServiceEntriesWithHealth(session),
    getCurrentExpenseEntriesWithHealth(session),
  ]);

  return {
    fuelInvalidRows: fuel.invalidRowCount,
    serviceInvalidRows: service.invalidRowCount,
    expenseInvalidRows: expenses.invalidRowCount,
    totalInvalidRows:
      fuel.invalidRowCount +
      service.invalidRowCount +
      expenses.invalidRowCount,
  };
}

export { emptyHealth };
