import type { Metadata } from "next";
import MortgageDashboard from "@/components/mortgage/MortgageDashboard";

export const metadata: Metadata = { title: "Mortgage Tools" };

export default function MortgagePage() {
  return <MortgageDashboard />;
}
