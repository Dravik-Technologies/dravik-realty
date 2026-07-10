"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { NOTIF_PREFS } from "../../data/settings";
import type { NotifPref } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── Toggle switch ────────────────────────────────────────────
function Toggle({ enabled, onChange, label }: {
  enabled:  boolean;
  onChange: (v: boolean) => void;
  label:    string;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
        enabled ? "bg-gold" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

// ─── Category header ──────────────────────────────────────────
function CategoryHeader({ label }: { label: string }) {
  return (
    <tr className="bg-surface-2">
      <td colSpan={4} className="px-5 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      </td>
    </tr>
  );
}

// ─── NotificationsPanel ───────────────────────────────────────
export default function NotificationsPanel({ onSave }: { onSave: () => void }) {
  const [prefs,        setPrefs]        = useState<NotifPref[]>(NOTIF_PREFS);
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [quietFrom,    setQuietFrom]    = useState("10:00 PM");
  const [quietTo,      setQuietTo]      = useState("7:00 AM");

  function toggle(id: string, channel: "email" | "sms" | "push") {
    setPrefs((prev) =>
      prev.map((p) => p.id !== id ? p : { ...p, [channel]: !p[channel] })
    );
  }

  // Group by category
  const categories = Array.from(new Set(prefs.map((p) => p.category)));

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-dravik-dark">Notification Preferences</h3>
          <p className="text-xs text-gray-400 mt-0.5">Control how and when Dravik Realty notifies you.</p>
        </div>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-gold text-dravik-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
        >
          Save Preferences
        </button>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event</th>
              <th className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Mail size={12} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Email</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <MessageSquare size={12} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">SMS</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Smartphone size={12} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Push</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <>
                <CategoryHeader key={`cat-${cat}`} label={cat} />
                {prefs.filter((p) => p.category === cat).map((pref) => (
                  <tr key={pref.id} className="border-b border-line last:border-0 hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-dravik-dark">{pref.label}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        <Toggle enabled={pref.email} onChange={() => toggle(pref.id, "email")} label={`${pref.label} email`} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        <Toggle enabled={pref.sms} onChange={() => toggle(pref.id, "sms")} label={`${pref.label} sms`} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        <Toggle enabled={pref.push} onChange={() => toggle(pref.id, "push")} label={`${pref.label} push`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Global quiet hours */}
      <div className="bg-white border border-line rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={15} className="text-gold" />
          <h4 className="text-sm font-bold text-dravik-dark">Quiet Hours</h4>
        </div>
        <p className="text-xs text-gray-500 mb-4">Suppress non-urgent push and SMS notifications during these hours.</p>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold mb-1.5">From</p>
            <select
              value={quietFrom}
              onChange={(e) => setQuietFrom(e.target.value)}
              className="px-3 py-2 bg-surface border border-line rounded-xl text-sm text-dravik-dark focus:outline-none focus:border-gold transition"
            >
              {["8:00 PM","9:00 PM","10:00 PM","11:00 PM"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-semibold mb-1.5">To</p>
            <select
              value={quietTo}
              onChange={(e) => setQuietTo(e.target.value)}
              className="px-3 py-2 bg-surface border border-line rounded-xl text-sm text-dravik-dark focus:outline-none focus:border-gold transition"
            >
              {["6:00 AM","7:00 AM","8:00 AM","9:00 AM"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Toggle enabled={quietEnabled} onChange={() => setQuietEnabled((v) => !v)} label="Enable quiet hours" />
            <span className="text-xs text-gray-500">{quietEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
