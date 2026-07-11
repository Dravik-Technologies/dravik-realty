import { redirect } from "next/navigation";
import { clearClientPortalSession } from "@/auth/server";

export async function GET() {
  await clearClientPortalSession();
  redirect("/portal/login");
}
