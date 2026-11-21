import type {
  CreateVehicleDocumentInput,
  UpdateVehicleDocumentInput,
  VehicleDocument,
} from "@/types/car";

async function request(
  method: "POST" | "PUT",
  input: CreateVehicleDocumentInput | UpdateVehicleDocumentInput,
) {
  const response = await fetch("/api/documents", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || "Η αποθήκευση του εγγράφου απέτυχε.");
  }

  return response.json() as Promise<{ entry: VehicleDocument }>;
}

export function createVehicleDocument(input: CreateVehicleDocumentInput) {
  return request("POST", input);
}

export function updateVehicleDocument(input: UpdateVehicleDocumentInput) {
  return request("PUT", input);
}
