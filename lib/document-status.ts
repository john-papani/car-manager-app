import type { VehicleDocument, VehicleDocumentType } from "@/types/car";

export const documentTypeLabels: Record<VehicleDocumentType, string> = {
  insurance: "Ασφάλεια",
  kteo: "ΚΤΕΟ",
  road_tax: "Τέλη κυκλοφορίας",
  roadside_assistance: "Οδική βοήθεια",
};

export type DocumentStatus = "expired" | "expiring" | "active";

function utcDay(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

export function getDocumentStatus(
  expiresAt: string,
  today = new Date(),
): { status: DocumentStatus; daysRemaining: number } {
  const daysRemaining = Math.round(
    (utcDay(expiresAt) - utcDay(today)) / 86_400_000,
  );

  return {
    status: daysRemaining < 0 ? "expired" : daysRemaining <= 30 ? "expiring" : "active",
    daysRemaining,
  };
}

export function sortDocumentsByUrgency(documents: VehicleDocument[]) {
  return [...documents].sort((left, right) =>
    left.expires_at.localeCompare(right.expires_at),
  );
}
