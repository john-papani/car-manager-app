"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Αρχική" },
  { href: "/fuel", label: "Καύσιμα" },
  { href: "/service", label: "Service" },
  { href: "/expenses", label: "Έξοδα" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-4 pt-3">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/60 bg-[rgb(255_251_246_/_0.86)] p-2 shadow-[0_18px_60px_rgb(18_49_59_/_0.18)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[1.2rem] px-2 py-3 text-center text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-[var(--navy)] !text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)]"
                    : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
