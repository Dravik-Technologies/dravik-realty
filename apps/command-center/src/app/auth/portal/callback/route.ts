import { redirect } from "next/navigation";
import { completeEntraPortalSignIn } from "@/auth/entra";
import { setClientPortalSession } from "@/auth/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let result: Awaited<ReturnType<typeof completeEntraPortalSignIn>>;

  try {
    result = await completeEntraPortalSignIn(request);
  } catch {
    redirect("/portal/login?auth=failed");
  }

  await setClientPortalSession(result.session);
  redirect(result.redirectTo);
}
