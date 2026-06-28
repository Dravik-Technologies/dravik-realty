"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { ClientDashboard, ALL_CLIENTS } from "@dravik/portal";
import { cn } from "@dravik/shared";

export default function PortalPage() {
  const [clientIdx, setClientIdx] = useState(0);
  const data = ALL_CLIENTS[clientIdx];

  return (
    <>
      {/* Demo auth banner */}
      <div className="sticky top-0 z-30 bg-axen-dark border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Logged in as <span className="text-white font-semibold">{data.client.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-gray-500" />
          <span className="text-[10px] text-gray-500 mr-1 hidden sm:inline">Switch client (demo):</span>
          <div className="flex gap-1">
            {ALL_CLIENTS.map((c, i) => (
              <button
                key={c.client.id}
                onClick={() => setClientIdx(i)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors",
                  clientIdx === i
                    ? "bg-gold text-axen-dark"
                    : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                )}
              >
                {c.client.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ClientDashboard key={data.client.id} data={data} />
    </>
  );
}
