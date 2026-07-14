import { redirect } from "next/navigation";
import { Building2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@dravik/shared";
import {
  createCommandSession,
  getCommandSession,
  isEntraAreaConfigured,
  isEntraIdentityEnabled,
  isLocalIdentityEnabled,
} from "@/auth/server";
import { BrandLogo } from "@/components/brand/BrandLogo";

async function signInCommandCenter() {
  "use server";

  await createCommandSession();
  redirect("/dashboard");
}

export default async function LoginPage() {
  const session = await getCommandSession();
  const localIdentityEnabled = isLocalIdentityEnabled();
  const entraIdentityEnabled = isEntraIdentityEnabled();
  const entraConfigured = isEntraAreaConfigured("command-center");
  const signInEnabled = localIdentityEnabled || (entraIdentityEnabled && entraConfigured);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#FDFDFD_0%,#E5E4E2_34%,#B8BEC6_100%)] px-4 py-10 text-dravik-dark">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[1.75rem] border border-white/50 bg-white/68 shadow-2xl shadow-black/15 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#111418] px-7 py-8 text-white sm:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(253,253,253,0.16),rgba(229,228,226,0.04)_42%,rgba(47,47,47,0.28))]" />
          <div className="relative flex items-center gap-3">
            <BrandLogo variant="mark" className="h-14 w-14" priority />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-white">Dravik Realty</p>
              <p className="mt-1 text-xs font-semibold text-[#D1CFCF]">Command Center</p>
            </div>
          </div>
          <div className="relative my-14 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E5E4E2]">
              <Sparkles size={12} />
              Secure Brokerage Workspace
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              Run leads, listings, referrals, and closings from one command center.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#D1CFCF]">
              Sign in to manage your tenant workspace, collaborate across your team, and keep the full client journey organized from first contact to funded closing.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-3 text-xs text-[#D1CFCF] sm:grid-cols-3">
            {["Tenant-scoped data", "Microsoft Entra sign-in", "Production cloud deploy"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <ShieldCheck size={14} className="mb-2 text-[#E5E4E2]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <BrandLogo variant="mark" className="h-14 w-14 flex-shrink-0" priority />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Dravik Realty</p>
                <h2 className="text-2xl font-black text-dravik-dark">Welcome Back</h2>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-bold text-dravik-dark">Sign in to Command Center</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {localIdentityEnabled
                    ? "Local development access is enabled for testing this workspace."
                    : "Production access is protected by Microsoft Entra."}
                </p>
              </div>

              <div className="mb-5 flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
                <LockKeyhole size={16} className="mt-0.5 flex-shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-bold text-dravik-dark">Protected workspace</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {localIdentityEnabled
                      ? "This mode is for local validation before a cloud release."
                      : entraConfigured
                        ? "Use your approved Dravik Realty account to access production."
                        : "Authentication settings must be completed before sign-in is available."}
                  </p>
                </div>
              </div>

              <form action={signInCommandCenter}>
                <button
                  type="submit"
                  disabled={!signInEnabled}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                    signInEnabled
                      ? "bg-dravik-dark text-white hover:bg-black"
                      : "cursor-not-allowed bg-surface-2 text-gray-400"
                  )}
                >
                  <Building2 size={16} />
                  {localIdentityEnabled
                    ? "Continue to Local Workspace"
                    : entraConfigured
                      ? "Continue with Microsoft"
                      : "Sign-in configuration required"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
