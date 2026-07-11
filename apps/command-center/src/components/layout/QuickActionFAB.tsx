"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Users, Receipt, Globe, Megaphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@dravik/shared";

const ACTIONS = [
  { label: "Create Campaign",  icon: Megaphone, href: "/marketing",        bg: "bg-violet-500" },
  { label: "Partner Referral", icon: Globe,     href: "/referrals",             bg: "bg-gold"       },
  { label: "New Transaction",  icon: Receipt,   href: "/realty/transactions",   bg: "bg-emerald-500"},
  { label: "New Lead",         icon: Users,     href: "/crm/leads",             bg: "bg-blue-500"   },
];

// ─── ActionItem ───────────────────────────────────────────────
function ActionItem({ label, icon: Icon, href, bg, onClose }: {
  label:   string;
  icon:    React.ElementType;
  href:    string;
  bg:      string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3"
      aria-label={label}
    >
      <span className="text-xs font-semibold text-dravik-dark bg-white border border-line rounded-xl px-3 py-1.5 shadow-sm whitespace-nowrap select-none">
        {label}
      </span>
      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white transition-all duration-150 hover:scale-110 active:scale-95", bg)}>
        <Icon size={18} />
      </div>
    </Link>
  );
}

// ─── QuickActionFAB ───────────────────────────────────────────
export default function QuickActionFAB() {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    function onOutside(e: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) handleClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open, handleClose]);

  return (
    <div ref={fabRef} className="fixed bottom-6 right-6 z-[1000] flex flex-col-reverse items-end gap-3">
      {open && (
        <div className="flex flex-col-reverse gap-3 items-end animate-slide-up">
          {ACTIONS.map(a => (
            <ActionItem key={a.label} {...a} onClose={handleClose} />
          ))}
        </div>
      )}

      <button
        aria-label={open ? "Close quick actions" : "Quick actions"}
        onClick={() => setOpen(v => !v)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200",
          open
            ? "bg-dravik-dark text-white"
            : "bg-gold text-dravik-dark hover:bg-gold-dark hover:scale-105"
        )}
      >
        <div className={cn("transition-transform duration-200", open && "rotate-45")}>
          <Plus size={24} />
        </div>
      </button>
    </div>
  );
}
