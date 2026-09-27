type PageMainProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export default function PageMain({ children, compact = false }: PageMainProps) {
  return (
    <main
      className={`mx-auto min-h-screen w-full max-w-md px-3 py-4 min-[360px]:px-4 min-[360px]:py-5 ${compact ? "pb-8" : "pb-32"}`}
    >
      {children}
    </main>
  );
}
