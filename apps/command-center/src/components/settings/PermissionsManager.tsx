"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UserPlus, X, ExternalLink, Mail, Shield } from "lucide-react";
import type { SettingsUser, UserRole, UserStatus } from "@/types/settings";
import { SETTINGS_USERS } from "@/data/settings";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Role badge ───────────────────────────────────────────────
const ROLE_STYLE: Record<UserRole, string> = {
  "Principal Broker": "bg-gold-light text-gold-dark border-gold/30",
  "Team Lead":        "bg-blue-50 text-blue-700 border-blue-200",
  "Agent":            "bg-surface-2 text-gray-600 border-line",
  "Mortgage LO":      "bg-violet-50 text-violet-700 border-violet-200",
  "Admin":            "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_STYLE: Record<UserStatus, string> = {
  active:   "bg-emerald-50 text-emerald-600",
  inactive: "bg-gray-100 text-gray-400",
  pending:  "bg-amber-50 text-amber-600",
};

const ROLES: UserRole[] = ["Principal Broker", "Team Lead", "Agent", "Mortgage LO", "Admin"];

// ─── Invite Modal ─────────────────────────────────────────────
function InviteModal({ onClose, onInvite }: {
  onClose:  () => void;
  onInvite: (name: string, email: string, role: UserRole) => void;
}) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [role,  setRole]  = useState<UserRole>("Agent");
  const [error, setError] = useState("");
  const modalRef       = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    const id = requestAnimationFrame(() => {
      modalRef.current?.querySelector<HTMLElement>("input, button, select")?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !modalRef.current) return;
      const els = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input, select, [tabindex]:not([tabindex='-1'])"
      ));
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus();
    };
  }, [handleClose]);

  function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Valid email is required."); return; }
    onInvite(name.trim(), email.trim(), role);
    handleClose();
  }

  const inputCls =
    "w-full px-3 py-2.5 bg-surface border border-line rounded-xl text-sm text-axen-dark " +
    "placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition";

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={handleClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="fixed z-50 inset-x-4 top-1/4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-line animate-slide-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <UserPlus size={16} className="text-gold" />
            <h2 id="invite-title" className="text-sm font-bold text-axen-dark">Invite Team Member</h2>
          </div>
          <button onClick={handleClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:text-axen-dark hover:bg-surface-2 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@axenrealty.com" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputCls}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line">
          <button onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-axen-dark transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-axen-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
          >
            <Mail size={12} /> Send Invitation
          </button>
        </div>
      </div>
    </>
  );
}

// ─── PermissionsManager ───────────────────────────────────────
export default function PermissionsManager({ onSave }: { onSave: () => void }) {
  const [users,      setUsers]      = useState<SettingsUser[]>(SETTINGS_USERS);
  const [showInvite, setShowInvite] = useState(false);

  function handleInvite(name: string, email: string, role: UserRole) {
    const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    setUsers((prev) => [...prev, {
      id:          `u-${Date.now()}`,
      name,
      email,
      role,
      status:      "pending",
      joinedDate:  "May 29, 2026",
      lastLogin:   "—",
      avatarColor: "#6B7280",
    }]);
    onSave();
    void initials; // used in data but not rendered here — suppress potential warning
  }

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-axen-dark">Team Members</h3>
          <p className="text-xs text-gray-400 mt-0.5">{users.filter((u) => u.status === "active").length} active · {users.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/team"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-line rounded-xl text-gray-500 hover:text-axen-dark hover:border-axen-dark transition-colors"
          >
            <ExternalLink size={12} /> Full Team View
          </Link>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gold text-axen-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
          >
            <UserPlus size={12} /> Invite
          </button>
        </div>
      </div>

      {/* Role summary pills */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          if (!count) return null;
          return (
            <span key={role} className={cn("text-[10px] font-semibold border px-2.5 py-1 rounded-full", ROLE_STYLE[role])}>
              {count} {role}{count !== 1 ? "s" : ""}
            </span>
          );
        })}
      </div>

      {/* User table */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Last Login</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line last:border-0 hover:bg-surface/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: user.avatarColor }}
                    >
                      {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-axen-dark">{user.name}</p>
                      <p className="text-[10px] text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", ROLE_STYLE[user.role])}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-[11px] text-gray-500">{user.lastLogin}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full", STATUS_STYLE[user.status])}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    disabled
                    title="Role permissions editor coming soon"
                    className="p-1 rounded-lg text-gray-200 cursor-not-allowed"
                  >
                    <Shield size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      )}
    </div>
  );
}
