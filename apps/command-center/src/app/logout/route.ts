import { redirect } from "next/navigation";
import { clearCommandSession } from "@/auth/server";

export async function GET() {
  await clearCommandSession();
  redirect("/login");
}
