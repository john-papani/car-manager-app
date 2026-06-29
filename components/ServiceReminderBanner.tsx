"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getServiceReminderMessage,
  type ServiceReminder,
} from "@/lib/service-reminders";

type ServiceReminderBannerProps = {
  reminder: ServiceReminder;
  compact?: boolean;
};

function urgencyClasses(urgency: ServiceReminder["urgency"]) {
  switch (urgency) {
    case "overdue":
      return "border-red-200 bg-red-50 text-red-950";
    case "due_soon":
      return "border-amber-200 bg-amber-50 text-amber-950";
    default:
      return "border-sky-200 bg-sky-50 text-sky-950";
  }
}

function notificationStorageKey(reminder: ServiceReminder) {
  return `service-reminder-notified:${reminder.nextOdometer}:${reminder.currentOdometer}`;
}

function buildMailtoLink(reminder: ServiceReminder) {
  const subject = encodeURIComponent("Υπενθύμιση service — Car Manager");
  const body = encodeURIComponent(
    `${getServiceReminderMessage(reminder)}\n\nΕπόμενο service στα ${reminder.nextOdometer.toLocaleString("el-GR")} km.\nΤρέχον κοντέρ: ${reminder.currentOdometer.toLocaleString("el-GR")} km.`,
  );

  return `mailto:?subject=${subject}&body=${body}`;
}

export default function ServiceReminderBanner({
  reminder,
  compact = false,
}: ServiceReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const message = getServiceReminderMessage(reminder);

  useEffect(() => {
    if (dismissed || reminder.urgency === "upcoming") {
      return;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const storageKey = notificationStorageKey(reminder);
    const alreadyNotified = window.localStorage.getItem(storageKey);

    if (alreadyNotified) {
      return;
    }

    const showNotification = () => {
      new Notification("Υπενθύμιση service", {
        body: message,
        tag: storageKey,
      });
      window.localStorage.setItem(storageKey, new Date().toISOString());
    };

    if (Notification.permission === "granted") {
      showNotification();
      return;
    }

    if (Notification.permission === "default") {
      void Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showNotification();
        }
      });
    }
  }, [dismissed, message, reminder]);

  if (dismissed) {
    return null;
  }

  return (
    <section
      className={`${compact ? "mt-0" : "mt-5"} rounded-[1.9rem] border p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)] ${urgencyClasses(reminder.urgency)}`}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
            Υπενθύμιση service
          </p>
          <p className="mt-2 text-sm font-semibold leading-6">{message}</p>
          <p className="mt-2 text-xs leading-5 opacity-80">
            Στόχος {reminder.nextOdometer.toLocaleString("el-GR")} km · τώρα{" "}
            {reminder.currentOdometer.toLocaleString("el-GR")} km
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full px-2 py-1 text-xs opacity-70 transition hover:opacity-100"
          aria-label="Απόκρυψη υπενθύμισης"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/service"
          className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold"
        >
          Ιστορικό service
        </Link>
        <a
          href={buildMailtoLink(reminder)}
          className="inline-flex rounded-full border border-current/15 px-3 py-1.5 text-xs font-semibold"
        >
          Email υπενθύμιση
        </a>
      </div>
    </section>
  );
}
