import { redirect } from "next/navigation";
import { createEntraLogoutUrl, isEntraAreaConfigured } from "@/auth/entra";
import {
  clearClientPortalSession,
  isEntraIdentityEnabled,
} from "@/auth/server";

export async function GET() {
  await clearClientPortalSession();

  if (isEntraIdentityEnabled() && isEntraAreaConfigured("client-portal")) {
    redirect(createEntraLogoutUrl("client-portal"));
  }

  redirect("/portal/login");
}
