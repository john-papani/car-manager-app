import { getSupabaseAdminClient } from "@/lib/supabase";
import type {
  ExpenseEntry,
  FuelEntry,
  ServiceEntry,
  VehicleProfile,
} from "@/types/car";

type FuelEntryRow = FuelEntry & {
  owner_id: string;
};

type ServiceEntryRow = ServiceEntry & {
  owner_id: string;
};

type ExpenseEntryRow = ExpenseEntry & {
  owner_id: string;
};

type VehicleProfileRow = VehicleProfile & {
  owner_id: string;
};

function unwrapSingleResult<T>(
  data: T | null,
  error: { code?: string; message: string } | null,
) {
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}

function stripOwnerId<T extends { owner_id: string }>(row: T) {
  const { owner_id, ...rest } = row;
  void owner_id;
  return rest;
}

export async function getHighestOdometer(
  table: "fuel_entries" | "service_entries" | "expense_entries",
  ownerId: string,
  excludeId?: string,
) {
  let query = getSupabaseAdminClient()
    .from(table)
    .select("odometer")
    .eq("owner_id", ownerId)
    .not("odometer", "is", null)
    .order("odometer", { ascending: false })
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.odometer ?? 0;
}

export async function listFuelEntries(ownerId: string): Promise<FuelEntry[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("fuel_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .order("odometer", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => stripOwnerId(row as FuelEntryRow));
}

export async function getFuelEntryById(ownerId: string, entryId: string) {
  const result = await getSupabaseAdminClient()
    .from("fuel_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .maybeSingle();

  const row = unwrapSingleResult(result.data as FuelEntryRow | null, result.error);
  return row ? stripOwnerId(row) : null;
}

export async function insertFuelEntry(ownerId: string, entry: FuelEntry) {
  const { data, error } = await getSupabaseAdminClient()
    .from("fuel_entries")
    .insert({ ...entry, owner_id: ownerId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return stripOwnerId(data as FuelEntryRow);
}

export async function updateFuelEntryRecord(ownerId: string, entry: FuelEntry) {
  const { data, error } = await getSupabaseAdminClient()
    .from("fuel_entries")
    .update({ ...entry, owner_id: ownerId })
    .eq("owner_id", ownerId)
    .eq("id", entry.id)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as FuelEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function deleteFuelEntryRecord(ownerId: string, entryId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from("fuel_entries")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as FuelEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function listServiceEntries(
  ownerId: string,
): Promise<ServiceEntry[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("service_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .order("odometer", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => stripOwnerId(row as ServiceEntryRow));
}

export async function getServiceEntryById(ownerId: string, entryId: string) {
  const result = await getSupabaseAdminClient()
    .from("service_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .maybeSingle();

  const row = unwrapSingleResult(
    result.data as ServiceEntryRow | null,
    result.error,
  );
  return row ? stripOwnerId(row) : null;
}

export async function insertServiceEntry(ownerId: string, entry: ServiceEntry) {
  const { data, error } = await getSupabaseAdminClient()
    .from("service_entries")
    .insert({ ...entry, owner_id: ownerId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return stripOwnerId(data as ServiceEntryRow);
}

export async function updateServiceEntryRecord(
  ownerId: string,
  entry: ServiceEntry,
) {
  const { data, error } = await getSupabaseAdminClient()
    .from("service_entries")
    .update({ ...entry, owner_id: ownerId })
    .eq("owner_id", ownerId)
    .eq("id", entry.id)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as ServiceEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function deleteServiceEntryRecord(
  ownerId: string,
  entryId: string,
) {
  const { data, error } = await getSupabaseAdminClient()
    .from("service_entries")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as ServiceEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function listExpenseEntries(
  ownerId: string,
): Promise<ExpenseEntry[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("expense_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => stripOwnerId(row as ExpenseEntryRow));
}

export async function getExpenseEntryById(ownerId: string, entryId: string) {
  const result = await getSupabaseAdminClient()
    .from("expense_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .maybeSingle();

  const row = unwrapSingleResult(
    result.data as ExpenseEntryRow | null,
    result.error,
  );
  return row ? stripOwnerId(row) : null;
}

export async function insertExpenseEntry(ownerId: string, entry: ExpenseEntry) {
  const { data, error } = await getSupabaseAdminClient()
    .from("expense_entries")
    .insert({ ...entry, owner_id: ownerId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return stripOwnerId(data as ExpenseEntryRow);
}

export async function updateExpenseEntryRecord(
  ownerId: string,
  entry: ExpenseEntry,
) {
  const { data, error } = await getSupabaseAdminClient()
    .from("expense_entries")
    .update({ ...entry, owner_id: ownerId })
    .eq("owner_id", ownerId)
    .eq("id", entry.id)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as ExpenseEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function deleteExpenseEntryRecord(
  ownerId: string,
  entryId: string,
) {
  const { data, error } = await getSupabaseAdminClient()
    .from("expense_entries")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", entryId)
    .select()
    .maybeSingle();

  const row = unwrapSingleResult(data as ExpenseEntryRow | null, error);
  return row ? stripOwnerId(row) : null;
}

export async function getVehicleProfile(ownerId: string) {
  const result = await getSupabaseAdminClient()
    .from("vehicle_profiles")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  const row = unwrapSingleResult(
    result.data as VehicleProfileRow | null,
    result.error,
  );
  return row ? stripOwnerId(row) : null;
}

export async function saveVehicleProfile(
  ownerId: string,
  profile: VehicleProfile,
) {
  const { data, error } = await getSupabaseAdminClient()
    .from("vehicle_profiles")
    .upsert({ ...profile, owner_id: ownerId }, { onConflict: "owner_id" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return stripOwnerId(data as VehicleProfileRow);
}
