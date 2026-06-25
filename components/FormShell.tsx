type FormShellProps = {
  children: React.ReactNode;
};

export const formInputClass =
  "w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3.5 text-base transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10";

export const formLabelClass =
  "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

export const formSectionClass =
  "rounded-[1.75rem] border border-[var(--line)] bg-[var(--card-strong)] p-4 shadow-sm";

export default function FormShell({ children }: FormShellProps) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--surface-shadow)]">
      {children}
    </div>
  );
}
