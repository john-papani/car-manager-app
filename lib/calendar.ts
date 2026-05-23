import { getCalendarClient } from "@/lib/google";
import type { FuelEntry } from "@/types/car";

export async function createFuelCalendarEvent(entry: FuelEntry) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendarId) {
    throw new Error("Missing GOOGLE_CALENDAR_ID");
  }

  const calendar = getCalendarClient();

  const title = `⛽ Καύσιμο - ${entry.total_cost.toFixed(2)}€`;

  const description = [
    `Χιλιόμετρα: ${entry.odometer.toLocaleString("el-GR")} km`,
    `Λίτρα: ${entry.liters.toFixed(2)} L`,
    `Κόστος: ${entry.total_cost.toFixed(2)} €`,
    `Τιμή/L: ${entry.price_per_liter.toFixed(3)} €/L`,
    `Πρατήριο: ${entry.station || "-"}`,
    `Full tank: ${entry.is_full_tank ? "Ναι" : "Όχι"}`,
    entry.notes ? `Σημειώσεις: ${entry.notes}` : null,
    entry.receipt_url ? `Απόδειξη: ${entry.receipt_url}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: title,
      description,
      location: entry.station || undefined,
      start: {
        date: entry.date,
      },
      end: {
        date: entry.date,
      },
    },
  });
}

export async function deleteCalendarEvent(eventId: string) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendarId || !eventId) return;

  const calendar = getCalendarClient();

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error: unknown) {
    const status = getGoogleApiErrorStatus(error);

    if (status === 404) {
      return;
    }

    throw error;
  }
}

function getGoogleApiErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }

  return null;
}
