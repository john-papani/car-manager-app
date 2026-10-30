"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemePreference = "system" | "light" | "dark";

const options: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Σύστημα" },
  { value: "light", label: "Φωτεινό" },
  { value: "dark", label: "Σκούρο" },
];

function applyTheme(preference: ThemePreference) {
  const theme =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.dataset.theme = theme;
}

function getThemePreference(): ThemePreference {
  const stored = window.localStorage.getItem("car-manager-theme");
  return stored === "light" || stored === "dark" ? stored : "system";
}

function getServerThemePreference(): ThemePreference {
  return "system";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

export default function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    getServerThemePreference,
  );

  useEffect(() => {
    applyTheme(preference);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => applyTheme("system");

    if (preference === "system") {
      media.addEventListener("change", syncSystemTheme);
    }

    return () => media.removeEventListener("change", syncSystemTheme);
  }, [preference]);

  function selectTheme(next: ThemePreference) {
    window.localStorage.setItem("car-manager-theme", next);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[var(--foreground)]">
        Εμφάνιση
      </legend>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-[1.2rem] bg-[var(--background-strong)] p-1.5">
        {options.map((option) => {
          const selected = preference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => selectTheme(option.value)}
              className={`rounded-[0.9rem] px-2 py-2.5 text-xs font-semibold transition ${
                selected
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
