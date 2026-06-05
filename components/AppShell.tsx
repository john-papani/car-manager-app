type AppShellProps = {
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
};

const featureCards = [
  {
    title: "Fuel tracking",
    description: "Consumption, cost and refill history.",
  },
  {
    title: "Service history",
    description: "Maintenance logs and reminders.",
  },
  {
    title: "Expenses",
    description: "Keep every car cost organized.",
  },
];

export default function AppShell({ children, bottomNav }: AppShellProps) {
  return (
    <div className="min-h-screen lg:bg-[radial-gradient(circle_at_top_left,rgba(91,33,182,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)] lg:px-6 lg:py-8">
      <div className="mx-auto min-h-screen max-w-6xl lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,15rem)_minmax(0,28rem)_minmax(0,18rem)] lg:items-center lg:gap-8 xl:grid-cols-[minmax(0,16rem)_minmax(0,28rem)_minmax(0,20rem)]">
        <div aria-hidden="true" className="hidden lg:block" />

        <div className="relative lg:min-h-[760px] lg:max-h-[860px] lg:overflow-hidden lg:rounded-[2.4rem] lg:border lg:border-white/10 lg:bg-slate-950 lg:shadow-[0_32px_80px_rgba(2,6,23,0.55)]">
          <div
            aria-hidden="true"
            className="pointer-events-none hidden lg:block lg:absolute lg:inset-0 lg:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.12),transparent_34%)]"
          />
          <div className="relative lg:flex lg:h-[820px] lg:justify-center lg:px-4 lg:py-5">
            <div className="relative w-full lg:flex lg:h-full lg:max-w-md lg:flex-col lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-[var(--background)] lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[&>main]:min-h-full lg:[&>main]:pb-32">
                {children}
              </div>
              {bottomNav}
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex lg:min-h-full lg:flex-col lg:justify-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Car Manager
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Everything about your car, in one clean place.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Track fuel, services, expenses and reminders while keeping the focused
              mobile-first experience.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
              Open it on your phone for the real app feel
            </div>

            <div className="mt-6 space-y-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {card.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
