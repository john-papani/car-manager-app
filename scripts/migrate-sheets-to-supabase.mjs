import nextEnv from "@next/env";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const SHEET_SCHEMAS = {
  fuel_entries: [
    "id",
    "date",
    "odometer",
    "liters",
    "total_cost",
    "price_per_liter",
    "station",
    "is_full_tank",
    "notes",
    "receipt_file_id",
    "receipt_url",
    "calendar_event_id",
    "created_at",
    "updated_at",
  ],
  service_entries: [
    "id",
    "date",
    "odometer",
    "total_cost",
    "service_type",
    "location",
    "next_service_odometer",
    "notes",
    "created_at",
    "updated_at",
  ],
  expense_entries: [
    "id",
    "date",
    "category",
    "total_cost",
    "odometer",
    "vendor",
    "notes",
    "created_at",
    "updated_at",
  ],
  vehicle_profile: [
    "id",
    "make",
    "model",
    "trim",
    "year",
    "license_plate",
    "fuel_type",
    "transmission",
    "engine",
    "color",
    "created_at",
    "updated_at",
  ],
};

function requireEnv(name, ...fallbackNames) {
  const value = [name, ...fallbackNames]
    .map((envName) => process.env[envName])
    .find(Boolean);

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function getArg(name) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : undefined;
}

async function resolveOwnerId(supabase, email) {
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (item) => item.email?.trim().toLowerCase() === normalizedEmail,
    );

    if (user) {
      return user.id;
    }

    if (data.users.length < 1000) {
      throw new Error(`No Supabase Auth user found for ${email}. Create the account first.`);
    }
  }
}

function getGoogleAuth() {
  const clientEmail = requireEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function getColumnName(columnNumber) {
  let current = columnNumber;
  let columnName = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    current = Math.floor((current - 1) / 26);
  }

  return columnName;
}

async function getSheetRows(sheetName) {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheetsClient = google.sheets({
    version: "v4",
    auth: getGoogleAuth(),
  });

  const headers = SHEET_SCHEMAS[sheetName];
  const range = `${sheetName}!A:${getColumnName(headers.length)}`;

  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    return [];
  }

  const [firstRow, ...restRows] = rows;

  const hasHeaderRow = firstRow.every(
    (value, index) => String(value ?? "").trim() === headers[index],
  );

  const dataRows = hasHeaderRow ? restRows : rows;

  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [
          header,
          String(row[index] ?? "").trim(),
        ]),
      ),
    );
}

function toNumber(value) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(",", ".");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  return normalized === "true" || normalized === "yes" || normalized === "1";
}

function toTimestamp(value) {
  return value || new Date().toISOString();
}

function getFuelLiters(row) {
  const liters = toNumber(row.liters);

  if (liters !== null) {
    return liters;
  }

  const totalCost = toNumber(row.total_cost);
  const pricePerLiter = toNumber(row.price_per_liter);

  if (totalCost !== null && pricePerLiter !== null && pricePerLiter > 0) {
    return Number((totalCost / pricePerLiter).toFixed(3));
  }

  return null;
}

function getFuelPricePerLiter(row) {
  const pricePerLiter = toNumber(row.price_per_liter);

  if (pricePerLiter !== null) {
    return pricePerLiter;
  }

  const totalCost = toNumber(row.total_cost);
  const liters = toNumber(row.liters);

  if (totalCost !== null && liters !== null && liters > 0) {
    return Number((totalCost / liters).toFixed(3));
  }

  return null;
}

function mapFuelRow(ownerId, row) {
  return {
    id: row.id,
    owner_id: ownerId,
    date: row.date,
    odometer: toNumber(row.odometer),
    liters: getFuelLiters(row),
    total_cost: toNumber(row.total_cost),
    price_per_liter: getFuelPricePerLiter(row),
    station: row.station || "",
    is_full_tank: toBoolean(row.is_full_tank),
    notes: row.notes || "",
    // Google Drive file ids are not Supabase Storage paths.
    receipt_file_id: "",
    receipt_url: row.receipt_url || "",
    calendar_event_id: row.calendar_event_id || "",
    created_at: toTimestamp(row.created_at),
    updated_at: toTimestamp(row.updated_at),
  };
}

function mapServiceRow(ownerId, row) {
  return {
    id: row.id,
    owner_id: ownerId,
    date: row.date,
    odometer: toNumber(row.odometer),
    total_cost: toNumber(row.total_cost),
    service_type: row.service_type,
    location: row.location || "",
    next_service_odometer: toNumber(row.next_service_odometer),
    notes: row.notes || "",
    created_at: toTimestamp(row.created_at),
    updated_at: toTimestamp(row.updated_at),
  };
}

function mapExpenseRow(ownerId, row) {
  return {
    id: row.id,
    owner_id: ownerId,
    date: row.date,
    category: row.category,
    total_cost: toNumber(row.total_cost),
    odometer: toNumber(row.odometer),
    vendor: row.vendor || "",
    notes: row.notes || "",
    created_at: toTimestamp(row.created_at),
    updated_at: toTimestamp(row.updated_at),
  };
}

function mapVehicleProfile(ownerId, row) {
  return {
    id: row.id || "vehicle-profile",
    owner_id: ownerId,
    make: row.make,
    model: row.model,
    trim: row.trim || "",
    year: toNumber(row.year),
    license_plate: row.license_plate || "",
    fuel_type: row.fuel_type || "",
    transmission: row.transmission || "",
    engine: row.engine || "",
    color: row.color || "",
    created_at: toTimestamp(row.created_at),
    updated_at: toTimestamp(row.updated_at),
  };
}

function validateFuelEntries(entries) {
  const invalidEntries = entries.filter(
    (entry) =>
      !entry.id ||
      !entry.owner_id ||
      !entry.date ||
      entry.odometer === null ||
      entry.liters === null ||
      entry.total_cost === null ||
      entry.price_per_liter === null,
  );

  if (invalidEntries.length === 0) {
    return;
  }

  console.error("Invalid fuel entries:");
  console.table(
    invalidEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      odometer: entry.odometer,
      liters: entry.liters,
      total_cost: entry.total_cost,
      price_per_liter: entry.price_per_liter,
      station: entry.station,
    })),
  );

  throw new Error(`Found ${invalidEntries.length} invalid fuel entries.`);
}

function validateServiceEntries(entries) {
  const invalidEntries = entries.filter(
    (entry) =>
      !entry.id ||
      !entry.owner_id ||
      !entry.date ||
      entry.odometer === null ||
      entry.total_cost === null ||
      !entry.service_type,
  );

  if (invalidEntries.length === 0) {
    return;
  }

  console.error("Invalid service entries:");
  console.table(
    invalidEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      odometer: entry.odometer,
      total_cost: entry.total_cost,
      service_type: entry.service_type,
      location: entry.location,
    })),
  );

  throw new Error(`Found ${invalidEntries.length} invalid service entries.`);
}

function validateExpenseEntries(entries) {
  const invalidEntries = entries.filter(
    (entry) =>
      !entry.id ||
      !entry.owner_id ||
      !entry.date ||
      !entry.category ||
      entry.total_cost === null,
  );

  if (invalidEntries.length === 0) {
    return;
  }

  console.error("Invalid expense entries:");
  console.table(
    invalidEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      category: entry.category,
      total_cost: entry.total_cost,
      odometer: entry.odometer,
      vendor: entry.vendor,
    })),
  );

  throw new Error(`Found ${invalidEntries.length} invalid expense entries.`);
}

async function upsertRows(supabase, table, rows, conflictTarget = "id") {
  if (rows.length === 0) {
    return 0;
  }

  const { error } = await supabase.from(table).upsert(rows, {
    onConflict: conflictTarget,
  });

  if (error) {
    throw error;
  }

  return rows.length;
}

async function main() {
  const ownerEmail =
    getArg("owner-email") || process.env.MIGRATION_OWNER_EMAIL || "";

  if (!ownerEmail) {
    throw new Error(
      "Missing owner email. Use --owner-email=user@example.com or MIGRATION_OWNER_EMAIL.",
    );
  }

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const ownerId = await resolveOwnerId(supabase, ownerEmail);

  console.log(
    `Google Sheets owner ${ownerEmail.trim()} maps to Supabase user ${ownerId}`,
  );

  const [fuelRows, serviceRows, expenseRows, vehicleRows] = await Promise.all([
    getSheetRows("fuel_entries"),
    getSheetRows("service_entries"),
    getSheetRows("expense_entries"),
    getSheetRows("vehicle_profile"),
  ]);

  const fuelEntries = fuelRows.map((row) => mapFuelRow(ownerId, row));
  const serviceEntries = serviceRows.map((row) => mapServiceRow(ownerId, row));
  const expenseEntries = expenseRows.map((row) => mapExpenseRow(ownerId, row));
  const vehicleProfile = vehicleRows[0]
    ? mapVehicleProfile(ownerId, vehicleRows[0])
    : null;

  validateFuelEntries(fuelEntries);
  validateServiceEntries(serviceEntries);
  validateExpenseEntries(expenseEntries);

  console.log(`- fuel_entries: ${fuelEntries.length}`);
  console.log(`- service_entries: ${serviceEntries.length}`);
  console.log(`- expense_entries: ${expenseEntries.length}`);
  console.log(`- vehicle_profiles: ${vehicleProfile ? 1 : 0}`);

  if (!process.argv.includes("--apply")) {
    console.log("Preview only. Add --apply to write these rows to Supabase.");
    return;
  }

  const [fuelCount, serviceCount, expenseCount] = await Promise.all([
    upsertRows(supabase, "fuel_entries", fuelEntries),
    upsertRows(supabase, "service_entries", serviceEntries),
    upsertRows(supabase, "expense_entries", expenseEntries),
  ]);

  let vehicleCount = 0;

  if (vehicleProfile) {
    vehicleCount = await upsertRows(
      supabase,
      "vehicle_profiles",
      [vehicleProfile],
      "owner_id",
    );
  }

  console.log("Migration complete.");
  console.log(`- fuel_entries: ${fuelCount}`);
  console.log(`- service_entries: ${serviceCount}`);
  console.log(`- expense_entries: ${expenseCount}`);
  console.log(`- vehicle_profiles: ${vehicleCount}`);
  console.log("Receipt files were not migrated. Existing Google Drive links were kept where available.");
}

main().catch((error) => {
  console.error("Migration failed.");
  console.error(error);
  process.exitCode = 1;
});
