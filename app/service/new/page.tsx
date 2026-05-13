import ServiceEntryForm from "@/components/ServiceEntryForm";

export default function NewServiceEntryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-32">
      <div className="mb-6 rounded-[1.9rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
          Service
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Νέα εργασία
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/72">
          Καταχώρησε συντήρηση, αλλαγή αναλωσίμων ή οποιαδήποτε εργασία έγινε
          στο αυτοκίνητο.
        </p>
      </div>

      <ServiceEntryForm />
    </main>
  );
}
