export type FuelSaveFeedback = {
  entryId: string;
  pendingReceipt: boolean;
  savedAt: number;
};

const STORAGE_KEY = "car-manager:fuel-save-feedback";

export function setFuelSaveFeedback(feedback: FuelSaveFeedback) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
}

export function consumeFuelSaveFeedback(): FuelSaveFeedback | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as FuelSaveFeedback;
  } catch {
    return null;
  }
}

export const FUEL_RECEIPT_ATTACHED_EVENT = "car-manager:fuel-receipt-attached";

export function notifyFuelReceiptAttached(entryId: string) {
  window.dispatchEvent(
    new CustomEvent(FUEL_RECEIPT_ATTACHED_EVENT, { detail: { entryId } }),
  );
}
