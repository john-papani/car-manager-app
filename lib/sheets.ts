import { cacheLife, cacheTag } from "next/cache";
import { getSheetsClient } from "@/lib/google";

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const SHEET_SCHEMAS: Record<string, string[]> = {
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
};

export function getSheetCacheTag(sheetName: string) {
  return `sheet:${sheetName}`;
}

function getColumnName(columnNumber: number) {
  let current = columnNumber;
  let columnName = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    current = Math.floor((current - 1) / 26);
  }

  return columnName;
}

function getSheetRange(sheetName: string) {
  const headers = SHEET_SCHEMAS[sheetName];

  if (!headers) {
    return `${sheetName}!A:Z`;
  }

  return `${sheetName}!A:${getColumnName(headers.length)}`;
}

function isRowEmpty(row: unknown[]) {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

function hasHeaderRow(row: unknown[], headers: string[]) {
  return headers.every(
    (header, index) => String(row[index] ?? "").trim() === header,
  );
}

function normalizeSchemaRow(row: string[], headers: string[]) {
  const normalizedRow =
    row.length > headers.length ? row.slice(-headers.length) : row;

  return headers.reduce<Record<string, string>>((item, header, index) => {
    item[header] = normalizedRow[index] ?? "";
    return item;
  }, {});
}

async function ensureSheetHeaders(sheetName: string) {
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const sheetsClient = getSheetsClient();
  const headers = SHEET_SCHEMAS[sheetName];
  const spreadsheet = await sheetsClient.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const existingTitles =
    spreadsheet.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter(Boolean) ?? [];

  if (!existingTitles.includes(sheetName)) {
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
  }

  if (!headers?.length) {
    return;
  }

  const headerRange = `${sheetName}!A1:${getColumnName(headers.length)}1`;
  const headerResponse = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  const firstRow = headerResponse.data.values?.[0] ?? [];
  const hasExpectedHeaders = headers.every(
    (header, index) => String(firstRow[index] ?? "").trim() === header,
  );

  if (!hasExpectedHeaders) {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });
  }
}

export async function appendRow(sheetName: string, values: unknown[]) {
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  await ensureSheetHeaders(sheetName);

  const sheetsClient = getSheetsClient();

  await sheetsClient.spreadsheets.values.append({
    spreadsheetId,
    range: getSheetRange(sheetName),
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

export async function deleteRowById(sheetName: string, rowId: string) {
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  if (!rowId) {
    throw new Error("Missing row id");
  }

  await ensureSheetHeaders(sheetName);

  const sheetsClient = getSheetsClient();
  const spreadsheet = await sheetsClient.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });
  const targetSheet = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName,
  );
  const sheetId = targetSheet?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error(`Sheet ${sheetName} was not found`);
  }

  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });
  const values = response.data.values || [];
  const schemaHeaders = SHEET_SCHEMAS[sheetName];
  const dataStartIndex =
    schemaHeaders && values[0] && hasHeaderRow(values[0], schemaHeaders)
      ? 1
      : 0;

  const rowIndex = values.findIndex((row, index) => {
    if (index < dataStartIndex) {
      return false;
    }

    return String(row[0] ?? "").trim() === rowId;
  });

  if (rowIndex === -1) {
    return false;
  }

  await sheetsClient.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return true;
}
export async function getRowById(
  sheetName: string,
  id: string,
): Promise<Record<string, string> | null> {
  const rows = await getRows(sheetName);

  const row = rows.find((item) => item.id === id);

  return row ?? null;
}

export async function getRows(sheetName: string) {
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  await ensureSheetHeaders(sheetName);

  const sheetsClient = getSheetsClient();

  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const values = response.data.values || [];

  if (values.length === 0) {
    return [];
  }

  const schemaHeaders = SHEET_SCHEMAS[sheetName];

  if (schemaHeaders) {
    const dataRows = hasHeaderRow(values[0], schemaHeaders)
      ? values.slice(1)
      : values;

    return dataRows
      .filter((row) => !isRowEmpty(row))
      .map((row) => normalizeSchemaRow(row, schemaHeaders));
  }

  if (values.length <= 1) {
    return [];
  }

  const [headers, ...rows] = values;

  return rows
    .filter((row) => !isRowEmpty(row))
    .map((row) => {
      const item: Record<string, string> = {};

      headers.forEach((header, index) => {
        item[String(header)] = row[index] ?? "";
      });

      return item;
    });
}

export async function getCachedRows(sheetName: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag(getSheetCacheTag(sheetName));

  return getRows(sheetName);
}
