"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, ShieldCheck, Users } from "lucide-react";
import type { ClientPortalSession } from "@dravik/contracts/identity";
import { ClientDashboard, ALL_CLIENTS } from "@dravik/portal";
import { cn, isDemoDataEnvironment } from "@dravik/shared";

export default function PortalClientView({ session }: { session: ClientPortalSession }) {
  const initialClientIdx = Math.max(
    0,
    ALL_CLIENTS.findIndex((client) => client.client.id === session.user.clientId)
  );
  const [clientIdx, setClientIdx] = useState(initialClientIdx);
  const data = ALL_CLIENTS[clientIdx];
  const sessionDisplayName = isDemoDataEnvironment
    ? session.user.name
    : "Staging Client Portal";

  if (!data) {
    return (
      <>
        <div className="brand-metal-surface sticky top-0 z-30 border-b border-[#FDFDFD]/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Logged in as <span className="text-[#FDFDFD] font-semibold">{sessionDisplayName}</span>
          </div>
          <Link
            href="/portal/logout"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#D1CFCF] hover:text-[#FDFDFD] transition-colors"
          >
            <LogOut size={11} />
            Sign out
          </Link>
        </div>

        <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
          <section className="w-full max-w-lg bg-white border border-line rounded-2xl p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gold-light flex items-center justify-center">
              <ShieldCheck size={22} className="text-gold" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-dravik-dark">No portal data yet</h1>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Staging starts with an empty client portal. Invitation-backed client access will create this workspace when production auth and storage are connected.
            </p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="brand-metal-surface sticky top-0 z-30 border-b border-[#FDFDFD]/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Logged in as <span className="text-[#FDFDFD] font-semibold">{data.client.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-[#D1CFCF]/70" />
            <span className="text-[10px] text-[#D1CFCF]/70 mr-1 hidden sm:inline">Switch client:</span>
            <div className="flex gap-1">
              {ALL_CLIENTS.map((c, i) => (
                <button
                  key={c.client.id}
                  onClick={() => setClientIdx(i)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors",
                    clientIdx === i
                      ? "bg-[#E5E4E2] text-[#2F2F2F]"
                      : "bg-[#FDFDFD]/10 text-[#D1CFCF] hover:bg-[#FDFDFD]/20 hover:text-[#FDFDFD]"
                  )}
                >
                  {c.client.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/portal/logout"
            className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#D1CFCF] hover:text-[#FDFDFD] transition-colors"
          >
            <LogOut size={11} />
            Sign out
          </Link>
        </div>
      </div>

      <ClientDashboard key={data.client.id} data={data} />
    </>
  );
}
