import Image from "next/image";
import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { createCommandSession, getCommandSession } from "@/auth/server";

async function signInCommandCenter() {
  "use server";

  await createCommandSession();
  redirect("/dashboard");
}

export default async function LoginPage() {
  const session = await getCommandSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-dravik-dark px-6 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1">
              <Image
                src="/dravik-realty-logo.webp"
                alt="Dravik Realty"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Dravik Realty</h1>
              <p className="text-xs text-gray-400 mt-1">Command Center</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-bold text-dravik-dark">Internal sign in</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Local identity stub for the realtor, broker, and admin workspace.
            </p>
          </div>

          <div className="bg-surface-2 border border-line rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={16} className="text-gold mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-dravik-dark">Azure-ready boundary</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                This local session shape is the seam that Microsoft Entra will replace in production.
              </p>
            </div>
          </div>

          <form action={signInCommandCenter}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-dravik-dark rounded-xl text-sm font-bold hover:bg-gold/90 transition-colors"
            >
              <Building2 size={16} />
              Continue as Chris Macabugao
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
