import type { FuelEntry, ServiceEntry } from "@/types/car";

export type ServiceReminderUrgency = "overdue" | "due_soon" | "upcoming";

export type ServiceReminder = {
  serviceType: string;
  sourceDate: string;
  nextOdometer: number;
  currentOdometer: number;
  kmRemaining: number;
  urgency: ServiceReminderUrgency;
};

export const SERVICE_DUE_SOON_KM = 500;
export const SERVICE_UPCOMING_KM = 2000;

export function getCurrentOdometer(
  fuelEntries: FuelEntry[],
  serviceEntries: ServiceEntry[],
) {
  const readings = [
    ...fuelEntries.map((entry) => entry.odometer),
    ...serviceEntries.map((entry) => entry.odometer),
  ];

  if (readings.length === 0) {
    return 0;
  }

  return Math.max(...readings);
}

export function getServiceReminder(
  serviceEntries: ServiceEntry[],
  currentOdometer: number,
): ServiceReminder | null {
  const candidates = serviceEntries
    .filter((entry) => entry.next_service_odometer)
    .map((entry) => {
      const nextOdometer = entry.next_service_odometer as number;
      const kmRemaining = nextOdometer - currentOdometer;

      let urgency: ServiceReminderUrgency = "upcoming";

      if (kmRemaining <= 0) {
        urgency = "overdue";
      } else if (kmRemaining <= SERVICE_DUE_SOON_KM) {
        urgency = "due_soon";
      } else if (kmRemaining <= SERVICE_UPCOMING_KM) {
        urgency = "upcoming";
      } else {
        return null;
      }

      return {
        serviceType: entry.service_type,
        sourceDate: entry.date,
        nextOdometer,
        currentOdometer,
        kmRemaining,
        urgency,
      };
    })
    .filter((candidate): candidate is ServiceReminder => candidate !== null)
    .sort((left, right) => left.kmRemaining - right.kmRemaining);

  return candidates[0] ?? null;
}

export function getServiceReminderMessage(reminder: ServiceReminder) {
  if (reminder.urgency === "overdue") {
    return `Το service «${reminder.serviceType}» έχει ξεπεράσει το όριο κατά ${Math.abs(reminder.kmRemaining).toLocaleString("el-GR")} km.`;
  }

  if (reminder.urgency === "due_soon") {
    return `Το service «${reminder.serviceType}» πλησιάζει — απομένουν ${reminder.kmRemaining.toLocaleString("el-GR")} km.`;
  }

  return `Το επόμενο service «${reminder.serviceType}» σε ${reminder.kmRemaining.toLocaleString("el-GR")} km.`;
}
