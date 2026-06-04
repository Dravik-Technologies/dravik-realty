import type { Metadata } from "next";
import ProspectingDashboard from "@/components/prospecting/ProspectingDashboard";

export const metadata: Metadata = { title: "Prospecting & Seller Leads Center" };

export default function ProspectingPage() {
  return <ProspectingDashboard />;
}
