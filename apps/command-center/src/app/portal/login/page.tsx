import { redirect } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { cn, isLocalDemoEnvironment } from "@dravik/shared";
import {
  createClientPortalSession,
  getClientPortalSession,
  isLocalIdentityEnabled,
} from "@/auth/server";
import { LOCAL_CLIENT_SESSIONS } from "@/auth/local-identity";
import { BrandLogo } from "@/components/brand/BrandLogo";

async function signInClientPortal(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId") ?? "c1");
  await createClientPortalSession(clientId);
  redirect("/portal");
}

export default async function PortalLoginPage() {
  const session = await getClientPortalSession();
  const localIdentityEnabled = isLocalIdentityEnabled();
  const localClientSessions = Object.values(LOCAL_CLIENT_SESSIONS);
  const visibleClientSessions = isLocalDemoEnvironment
    ? localClientSessions
    : localClientSessions.slice(0, 1);

  if (session) {
    redirect("/portal");
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="brand-metal-surface px-6 py-7 text-[#FDFDFD] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-16 w-36 flex-shrink-0" priority />
            <div>
              <h1 className="text-lg font-bold leading-none">Client Portal</h1>
              <p className="text-xs text-[#D1CFCF] mt-1">Dravik Realty</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-bold text-dravik-dark">Client sign in</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {localIdentityEnabled
                ? "Temporary staging access for transaction documents, messages, and status updates."
                : "Production client access will use invitation links."}
            </p>
          </div>

          <form action={signInClientPortal} className="space-y-2">
            {visibleClientSessions.map((clientSession) => {
              const displayName = isLocalDemoEnvironment
                ? clientSession.user.name
                : "Staging Client Portal";
              const displayEmail = isLocalDemoEnvironment
                ? clientSession.user.email
                : "empty staging workspace";

              return (
                <button
                  key={clientSession.user.clientId}
                  type="submit"
                  name="clientId"
                  value={clientSession.user.clientId}
                  disabled={!localIdentityEnabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 border border-line rounded-xl text-left transition-colors",
                    localIdentityEnabled
                      ? "hover:border-gold/50 hover:bg-gold-light"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-dravik-dark flex items-center justify-center text-gold">
                      <UserRound size={15} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-dravik-dark">{displayName}</span>
                      <span className="block text-xs text-gray-400">{displayEmail}</span>
                    </span>
                  </span>
                  <KeyRound size={14} className="text-gray-300" />
                </button>
              );
            })}
            {!localIdentityEnabled && (
              <p className="text-xs text-gray-400 text-center pt-2">
                Client invitation auth is not configured yet.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
