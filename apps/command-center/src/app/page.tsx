import { redirect } from "next/navigation";

// Root URL → always land on dashboard inside the shell
export default function RootPage() {
  redirect("/dashboard");
}
