import { requireClientPortalSession } from "@/auth/server";
import PortalClientView from "./PortalClientView";

export default async function PortalPage() {
  const session = await requireClientPortalSession();

  return <PortalClientView session={session} />;
}
