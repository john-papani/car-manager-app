import { getAppSession as auth } from "@/lib/app-session";
import BottomNav from "@/components/BottomNav";

export default async function AppBottomNav() {
  const session = await auth();

  return (
    <BottomNav
      userEmail={session?.user?.email ?? null}
      userName={session?.user?.name ?? null}
    />
  );
}
