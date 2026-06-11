import type { Metadata } from "next";
import AnalyticsDashboard from "@/components/reports/AnalyticsDashboard";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default function ReportsPage() {
  return <AnalyticsDashboard />;
}
