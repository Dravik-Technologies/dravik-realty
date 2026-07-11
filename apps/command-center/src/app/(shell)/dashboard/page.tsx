import type { Metadata } from "next";
import { requireCommandSession } from "@/auth/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireCommandSession();
  return <DashboardClient session={session} />;
}
