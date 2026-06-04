import type { Metadata } from "next";
import TeamDashboard from "@/components/team/TeamDashboard";

export const metadata: Metadata = { title: "Team Management" };

export default function TeamPage() {
  return <TeamDashboard />;
}
