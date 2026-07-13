import { redirect } from "next/navigation";
import {
  createEntraSignInUrl,
  isEntraAreaConfigured,
} from "@/auth/entra";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isEntraAreaConfigured("client-portal")) {
    redirect("/portal/login");
  }

  const returnTo = new URL(request.url).searchParams.get("returnTo") ?? "/portal";
  redirect(await createEntraSignInUrl("client-portal", returnTo));
}
