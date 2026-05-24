import type { UpdateVehicleProfileInput, VehicleProfile } from "@/types/car";

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function updateVehicleProfile(input: UpdateVehicleProfileInput) {
  const response = await fetch("/api/vehicle", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to save vehicle profile"),
    );
  }

  return (await response.json()) as { profile: VehicleProfile };
}
