import { redirect } from "next/navigation";
import { createEntraLogoutUrl, isEntraAreaConfigured } from "@/auth/entra";
import {
  clearCommandSession,
  isEntraIdentityEnabled,
} from "@/auth/server";

export async function GET() {
  await clearCommandSession();

  if (isEntraIdentityEnabled() && isEntraAreaConfigured("command-center")) {
    redirect(createEntraLogoutUrl("command-center"));
  }

  redirect("/login");
}
