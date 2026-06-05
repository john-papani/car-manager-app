"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BottomNavProps = {
  userEmail?: string | null;
  userName?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  {
    href: "/",
    label: "Αρχική",
    icon: (
      <path
        d="M3.75 8.25 12 2.25l8.25 6v9.75a.75.75 0 0 1-.75.75h-4.5v-5.25h-6v5.25h-4.5a.75.75 0 0 1-.75-.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    href: "/fuel",
    label: "Καύσιμα",
    icon: (
      <>
        <path
          d="M8.25 4.5h6a1.5 1.5 0 0 1 1.5 1.5v12h-9V6a1.5 1.5 0 0 1 1.5-1.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M15.75 8.25h1.125a1.125 1.125 0 0 1 1.125 1.125V15a1.5 1.5 0 0 0 3 0V9.75l-1.5-1.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M9.75 8.25h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
  },
  {
    href: "/service",
    label: "Service",
    icon: (
      <path
        d="m14.25 5.25 4.5 4.5-9 9H5.25v-4.5l9-9Zm0 0 2.25-2.25a1.591 1.591 0 0 1 2.25 2.25L16.5 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    href: "/expenses",
    label: "Έξοδα",
    icon: (
      <>
        <path
          d="M4.5 6.75h15v10.5h-15z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path d="M8.25 12h7.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="7" cy="10" r=".7" fill="currentColor" />
        <circle cx="17" cy="14" r=".7" fill="currentColor" />
      </>
    ),
  },
];

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
      <path
        d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm-6 7.5a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      {children}
    </svg>
  );
}

export default function BottomNav({ userEmail, userName }: BottomNavProps) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.endsWith("/new")) {
    return null;
  }

  const profileLabel = userName || userEmail || "Login";
  const profileHref = userEmail ? "/account" : "/login";
  const profileInitial = (userName || userEmail || "G").trim().charAt(0).toUpperCase();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] pt-2 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:max-w-none lg:translate-x-0">
      <div className="flex items-center gap-2 rounded-[1.7rem] border border-white/70 bg-[rgb(255_251_246_/_0.84)] px-2 py-2 shadow-[0_18px_40px_rgb(18_49_59_/_0.12)] backdrop-blur-xl">
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-1">
          {items.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`rounded-[1.1rem] px-1.5 py-2 text-center transition ${
                  isActive
                    ? "bg-[rgb(18_49_59_/_0.08)] text-[var(--navy)]"
                    : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--foreground)]"
                }`}
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full">
                    <NavIcon>{item.icon}</NavIcon>
                  </span>
                  <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href={profileHref}
          aria-label={userEmail ? "Λογαριασμός" : "Σύνδεση"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white/86 text-[var(--navy)] shadow-[0_8px_20px_rgb(18_49_59_/_0.08)] transition hover:bg-white"
          title={profileLabel}
        >
          {userEmail ? (
            <span className="text-xs font-semibold">{profileInitial}</span>
          ) : (
            <UserIcon />
          )}
        </Link>
      </div>
    </nav>
  );
}
