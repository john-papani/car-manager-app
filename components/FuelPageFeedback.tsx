"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  consumeFuelSaveFeedback,
  FUEL_RECEIPT_ATTACHED_EVENT,
} from "@/lib/fuel-save-feedback";
import { useToast } from "@/components/AppProviders";

export default function FuelPageFeedback() {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const feedback = consumeFuelSaveFeedback();

    if (!feedback) {
      return;
    }

    showToast("Το γέμισμα αποθηκεύτηκε.", "success");

    if (feedback.pendingReceipt) {
      showToast("Η απόδειξη ανεβαίνει στο background...", "info");
    }
  }, [showToast]);

  useEffect(() => {
    function handleReceiptAttached() {
      showToast("Η απόδειξη συνδέθηκε με την καταχώρηση.", "success");
      startTransition(() => {
        router.refresh();
      });
    }

    window.addEventListener(FUEL_RECEIPT_ATTACHED_EVENT, handleReceiptAttached);

    return () => {
      window.removeEventListener(
        FUEL_RECEIPT_ATTACHED_EVENT,
        handleReceiptAttached,
      );
    };
  }, [router, showToast, startTransition]);

  return null;
}
