type PageMainProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export default function PageMain({ children, compact = false }: PageMainProps) {
  return (
    <main
      className={`mx-auto min-h-screen w-full max-w-md px-4 py-5 ${compact ? "pb-8" : "pb-32"}`}
    >
      {children}
    </main>
  );
}
