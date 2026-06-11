import type { Metadata } from "next";
import InboxDashboard from "@/components/inbox/InboxDashboard";

export const metadata: Metadata = { title: "Unified Inbox" };

export default function InboxPage() {
  return <InboxDashboard />;
}
