"use client";

import { useState } from "react";
import { Upload, Building2 } from "lucide-react";
import { COMPANY_INFO } from "../../data/settings";
import { cn } from "@dravik/shared";

// ─── Shared input style ───────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 bg-surface border border-line rounded-xl text-sm text-dravik-dark " +
  "placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition";

// ─── Field label ──────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-500 mb-1.5">{children}</p>;
}

// ─── Section heading ──────────────────────────────────────────
function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-dravik-dark">{title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── GeneralSettings ──────────────────────────────────────────
export default function GeneralSettings({ onSave }: { onSave: () => void }) {
  const [info, setInfo] = useState(COMPANY_INFO);

  function set(field: keyof typeof COMPANY_INFO, value: string) {
    setInfo((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-8">

      {/* Logo & Identity */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <SectionHead title="Company Identity" sub="Logo, name, and branding details." />

        {/* Logo upload zone */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gold/40 bg-gold-light flex flex-col items-center justify-center flex-shrink-0">
            <div className="w-10 h-10 rounded-xl border border-gold/40 bg-gold/10 flex items-center justify-center">
              <span className="text-gold font-bold text-xl leading-none">DR</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-dravik-dark">Company Logo</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">PNG or SVG, min 256×256px recommended.</p>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-line rounded-lg hover:border-gold/40 text-gray-500 hover:text-dravik-dark transition-colors">
                <Upload size={12} /> Upload logo
              </span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Company Name</Label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Tagline</Label>
            <input
              type="text"
              value={info.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>DRE / License Number</Label>
            <input
              type="text"
              value={info.license}
              onChange={(e) => set("license", e.target.value)}
              className={cn(inputCls, "bg-surface-2")}
            />
          </div>
          <div>
            <Label>Company Website</Label>
            <input
              type="url"
              value={info.website}
              onChange={(e) => set("website", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <SectionHead title="Contact Information" sub="Primary phone, email, and office address." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <input
              type="tel"
              value={info.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>Email</Label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Street Address</Label>
            <input
              type="text"
              value={info.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>City</Label>
            <input
              type="text"
              value={info.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>State</Label>
              <input
                type="text"
                value={info.state}
                onChange={(e) => set("state", e.target.value)}
                className={inputCls}
                maxLength={2}
              />
            </div>
            <div>
              <Label>ZIP</Label>
              <input
                type="text"
                value={info.zip}
                onChange={(e) => set("zip", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company preview card */}
      <div className="bg-dravik-dark rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl border border-gold/40 bg-gold/10 flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-gold" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{info.name}</p>
          <p className="text-xs text-gray-400 truncate">{info.tagline}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{info.license} · {info.city}, {info.state}</p>
        </div>
        <button
          onClick={onSave}
          className="w-full sm:w-auto sm:ml-auto flex-shrink-0 px-4 py-2 bg-gold text-dravik-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
}
