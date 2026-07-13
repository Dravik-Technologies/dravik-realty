import { redirect } from "next/navigation";
import { completeEntraCommandSignIn } from "@/auth/entra";
import { setCommandSession } from "@/auth/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let result: Awaited<ReturnType<typeof completeEntraCommandSignIn>>;

  try {
    result = await completeEntraCommandSignIn(request);
  } catch {
    redirect("/login?auth=failed");
  }

  await setCommandSession(result.session);
  redirect(result.redirectTo);
}
