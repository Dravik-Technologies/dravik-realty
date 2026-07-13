import { redirect } from "next/navigation";
import {
  createEntraSignInUrl,
  isEntraAreaConfigured,
} from "@/auth/entra";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isEntraAreaConfigured("command-center")) {
    redirect("/login");
  }

  const returnTo = new URL(request.url).searchParams.get("returnTo") ?? "/dashboard";
  redirect(await createEntraSignInUrl("command-center", returnTo));
}
