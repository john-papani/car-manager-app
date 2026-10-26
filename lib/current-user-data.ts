import { auth, type AppSession } from "@/auth";
import { isExpenseEntryValid, mapRowToExpenseEntry } from "@/lib/expense-entry";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import { loadMappedRows, type RowLoadResult } from "@/lib/row-load-result";
import { isServiceEntryValid, mapRowToServiceEntry } from "@/lib/service-entry";
import { getSessionOwnerId } from "@/lib/supabase";
import {
  getVehicleProfile,
  listExpenseEntries,
  listFuelEntries,
  listServiceEntries,
} from "@/lib/supabase-data";
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

async function resolveSession(session?: AppSession | null) {
  return session === undefined ? auth() : session;
}

function emptyHealth(): DataLoadHealth {
  return { invalidRowCount: 0 };
}

function requireResolvedSession(session: AppSession | null | undefined) {
  if (!session?.user) {
    throw new Error("Missing authenticated session");
  }

  return session;
}

function toStringRecord(
  item: Record<string, string | number | boolean | null | undefined>,
) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      value === undefined || value === null ? "" : String(value),
    ]),
  );
}

export async function getCurrentFuelEntriesWithHealth(
  session?: AppSession | null,
): Promise<RowLoadResult<FuelEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  const rows = (
    await listFuelEntries(getSessionOwnerId(requireResolvedSession(resolvedSession)))
  ).map(toStringRecord);
  const result = loadMappedRows(rows, mapRowToFuelEntry, (entry) =>
    isFuelEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentFuelEntries(
  session?: AppSession | null,
): Promise<FuelEntry[]> {
  const { entries } = await getCurrentFuelEntriesWithHealth(session);
  return entries;
}

export async function getCurrentServiceEntriesWithHealth(
  session?: AppSession | null,
): Promise<RowLoadResult<ServiceEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  const rows = (
    await listServiceEntries(
      getSessionOwnerId(requireResolvedSession(resolvedSession)),
    )
  ).map(toStringRecord);
  const result = loadMappedRows(rows, mapRowToServiceEntry, (entry) =>
    isServiceEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentServiceEntries(
  session?: AppSession | null,
): Promise<ServiceEntry[]> {
  const { entries } = await getCurrentServiceEntriesWithHealth(session);
  return entries;
}

export async function getCurrentExpenseEntriesWithHealth(
  session?: AppSession | null,
): Promise<RowLoadResult<ExpenseEntry> & DataLoadHealth> {
  const resolvedSession = await resolveSession(session);

  const rows = (
    await listExpenseEntries(
      getSessionOwnerId(requireResolvedSession(resolvedSession)),
    )
  ).map(toStringRecord);
  const result = loadMappedRows(rows, mapRowToExpenseEntry, (entry) =>
    isExpenseEntryValid(entry),
  );

  return { ...result, invalidRowCount: result.invalidRowCount };
}

export async function getCurrentExpenseEntries(
  session?: AppSession | null,
): Promise<ExpenseEntry[]> {
  const { entries } = await getCurrentExpenseEntriesWithHealth(session);
  return entries;
}

export async function getCurrentVehicleProfile(
  session?: AppSession | null,
): Promise<VehicleProfile | null> {
  const resolvedSession = await resolveSession(session);

  const profile = await getVehicleProfile(
    getSessionOwnerId(requireResolvedSession(resolvedSession)),
  );

  if (!profile) {
    return null;
  }

  const mappedProfile = mapRowToVehicleProfile(toStringRecord(profile));

  return isVehicleProfileValid(mappedProfile) ? mappedProfile : null;
}

export async function getDataHealthSummary(session?: AppSession | null) {
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
