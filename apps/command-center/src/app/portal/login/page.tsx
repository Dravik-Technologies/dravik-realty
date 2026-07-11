import Image from "next/image";
import { redirect } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { createClientPortalSession, getClientPortalSession } from "@/auth/server";
import { LOCAL_CLIENT_SESSIONS } from "@/auth/local-identity";

async function signInClientPortal(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId") ?? "c1");
  await createClientPortalSession(clientId);
  redirect("/portal");
}

export default async function PortalLoginPage() {
  const session = await getClientPortalSession();

  if (session) {
    redirect("/portal");
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-dravik-dark px-6 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1">
              <Image
                src="/dravik-realty-logo.png"
                alt="Dravik Realty"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Client Portal</h1>
              <p className="text-xs text-gray-400 mt-1">Dravik Realty</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-bold text-dravik-dark">Client sign in</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Local client-access stub for transaction documents, messages, and status updates.
            </p>
          </div>

          <form action={signInClientPortal} className="space-y-2">
            {Object.values(LOCAL_CLIENT_SESSIONS).map((clientSession) => (
              <button
                key={clientSession.user.clientId}
                type="submit"
                name="clientId"
                value={clientSession.user.clientId}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-line rounded-xl text-left hover:border-gold/50 hover:bg-gold-light transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-dravik-dark flex items-center justify-center text-gold">
                    <UserRound size={15} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-dravik-dark">{clientSession.user.name}</span>
                    <span className="block text-xs text-gray-400">{clientSession.user.email}</span>
                  </span>
                </span>
                <KeyRound size={14} className="text-gray-300" />
              </button>
            ))}
          </form>
        </div>
      </section>
    </main>
  );
}
