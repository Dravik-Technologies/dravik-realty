import type { ReactNode } from "react";
import { ShellProvider } from "@/components/layout/ShellProvider";
import Sidebar        from "@/components/layout/Sidebar";
import Header         from "@/components/layout/Header";
import QuickActionFAB from "@/components/layout/QuickActionFAB";
import { requireCommandSession } from "@/auth/server";

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const session = await requireCommandSession();

  return (
    <ShellProvider>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header session={session} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <QuickActionFAB />
    </ShellProvider>
  );
}
