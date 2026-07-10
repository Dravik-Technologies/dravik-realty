"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ChevronRight, ChevronLeft, Check,
  User, Shield, DollarSign, ClipboardList,
} from "lucide-react";
import type { Agent, LicenseType, AgentRole } from "@dravik/contracts/broker";
import { TEAMS } from "../../data/team";
import { cn } from "@dravik/shared";

// ─── Form state ───────────────────────────────────────────────
interface FormData {
  firstName:     string;
  lastName:      string;
  email:         string;
  phone:         string;
  address:       string;
  licenseType:   LicenseType;
  licenseNumber: string;
  licenseExpiry: string;
  eAndOExpiry:   string;
  teamId:        string;
  splitPercent:  number;
  role:          AgentRole;
}

const INITIAL: FormData = {
  firstName: "", lastName: "", email: "", phone: "", address: "",
  licenseType: "RE", licenseNumber: "", licenseExpiry: "", eAndOExpiry: "",
  teamId: "direct", splitPercent: 65, role: "Agent",
};

const STEPS = [
  { id: 1, label: "Personal Info",    icon: User          },
  { id: 2, label: "Licensing",        icon: Shield        },
  { id: 3, label: "Commission",       icon: DollarSign    },
  { id: 4, label: "Review & Submit",  icon: ClipboardList },
];

// ─── Input helpers ────────────────────────────────────────────
function Field({
  label, children, hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-dravik-dark mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm bg-surface border border-line rounded-xl text-dravik-dark placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition";
const selectCls = "w-full px-3 py-2 text-sm bg-surface border border-line rounded-xl text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition";

// ─── Step components (module level) ──────────────────────────
function StepPersonal({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name">
          <input className={inputCls} placeholder="First" value={data.firstName}
            onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Last Name">
          <input className={inputCls} placeholder="Last" value={data.lastName}
            onChange={(e) => set("lastName", e.target.value)} />
        </Field>
      </div>
      <Field label="Email">
        <input type="email" className={inputCls} placeholder="agent@dravikrealty.com" value={data.email}
          onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Phone">
        <input type="tel" className={inputCls} placeholder="(305) 555-0100" value={data.phone}
          onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Office Address">
        <input className={inputCls} placeholder="Street, City, State ZIP" value={data.address}
          onChange={(e) => set("address", e.target.value)} />
      </Field>
    </div>
  );
}

function StepLicensing({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
  return (
    <div className="space-y-4">
      <Field label="License Type">
        <select className={selectCls} value={data.licenseType}
          onChange={(e) => set("licenseType", e.target.value as LicenseType)}>
          <option value="RE">Real Estate (RE)</option>
          <option value="Mortgage">Mortgage Only</option>
          <option value="Dual">Dual — RE + Mortgage</option>
        </select>
      </Field>
      <Field label="License Number" hint="e.g. SL3456789 or NMLS-1234567">
        <input className={inputCls} placeholder="SL0000000" value={data.licenseNumber}
          onChange={(e) => set("licenseNumber", e.target.value)} />
      </Field>
      <Field label="License Expiry">
        <input type="date" className={inputCls} value={data.licenseExpiry}
          onChange={(e) => set("licenseExpiry", e.target.value)} />
      </Field>
      <Field label="E&O Insurance Expiry">
        <input type="date" className={inputCls} value={data.eAndOExpiry}
          onChange={(e) => set("eAndOExpiry", e.target.value)} />
      </Field>
    </div>
  );
}

function StepCommission({ data, set }: { data: FormData; set: (k: keyof FormData, v: string | number) => void }) {
  const dravikCut = 100 - data.splitPercent;
  return (
    <div className="space-y-4">
      <Field label="Starting Role">
        <select className={selectCls} value={data.role}
          onChange={(e) => set("role", e.target.value as AgentRole)}>
          <option value="Agent">Agent</option>
          <option value="Team Lead">Team Lead</option>
          <option value="Mortgage Officer">Mortgage Officer</option>
        </select>
      </Field>
      <Field label="Team Assignment">
        <select className={selectCls} value={data.teamId}
          onChange={(e) => set("teamId", e.target.value)}>
          {TEAMS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Field>
      <Field label={`Agent Split: ${data.splitPercent}% / Dravik: ${dravikCut}%`}
        hint="Drag to set the agent's commission percentage">
        <input
          type="range" min={50} max={90} step={1}
          value={data.splitPercent}
          onChange={(e) => set("splitPercent", Number(e.target.value))}
          className="gold-slider w-full"
          style={{
            background: `linear-gradient(to right, #D4AF37 ${data.splitPercent - 50}%, #F1F3F5 ${data.splitPercent - 50}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>50%</span><span>70%</span><span>90%</span>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gold-light rounded-xl border border-gold/20 p-3 text-center">
          <p className="text-xl font-bold text-gold">{data.splitPercent}%</p>
          <p className="text-[10px] text-gray-500">Agent</p>
        </div>
        <div className="bg-surface rounded-xl border border-line p-3 text-center">
          <p className="text-xl font-bold text-dravik-dark">{dravikCut}%</p>
          <p className="text-[10px] text-gray-500">Dravik Realty</p>
        </div>
      </div>
    </div>
  );
}

function StepReview({ data }: { data: FormData }) {
  const teamName = TEAMS.find((t) => t.id === data.teamId)?.name ?? "—";
  const rows: { label: string; value: string }[] = [
    { label: "Full Name",      value: `${data.firstName} ${data.lastName}`.trim() || "—" },
    { label: "Email",          value: data.email        || "—" },
    { label: "Phone",          value: data.phone        || "—" },
    { label: "License Type",   value: data.licenseType },
    { label: "License #",      value: data.licenseNumber || "—" },
    { label: "License Expiry", value: data.licenseExpiry || "—" },
    { label: "Role",           value: data.role },
    { label: "Team",           value: teamName },
    { label: "Split",          value: `${data.splitPercent}% / ${100 - data.splitPercent}%` },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Review the information below before adding this agent to the roster.</p>
      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        {rows.map(({ label, value }, i) => (
          <div key={label} className={cn("flex items-center justify-between px-4 py-2.5 text-sm", i > 0 && "border-t border-line")}>
            <span className="text-gray-400 font-medium">{label}</span>
            <span className="font-semibold text-dravik-dark">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OnboardingForm ───────────────────────────────────────────
interface Props {
  open:     boolean;
  onClose:  () => void;
  onSubmit: (data: Partial<Agent>) => void;
}

export default function OnboardingForm({ open, onClose, onSubmit }: Props) {
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState<FormData>(INITIAL);
  const [done, setDone]     = useState(false);

  const modalRef       = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setStep(1);
    setData(INITIAL);
    setDone(false);
    onClose();
  }, [onClose]);

  // Save focus target before open; restore it after close; focus first element on open
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement;
      const id = requestAnimationFrame(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled])"
        );
        focusable?.[0]?.focus();
      });
      return () => cancelAnimationFrame(id);
    } else {
      returnFocusRef.current?.focus();
    }
  }, [open]);

  // Escape closes; Tab cycles within modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  function set(key: keyof FormData, value: string | number) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    onSubmit({
      name:          `${data.firstName} ${data.lastName}`.trim(),
      initials:      `${data.firstName[0] ?? "?"}${data.lastName[0] ?? ""}`.toUpperCase(),
      color:         "#6366F1",
      email:         data.email,
      phone:         data.phone,
      address:       data.address,
      licenseType:   data.licenseType,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      eAndOExpiry:   data.eAndOExpiry,
      status:        "Onboarding",
      role:          data.role,
      teamId:        data.teamId,
      splitPercent:  data.splitPercent,
      dravikCutPercent: 100 - data.splitPercent,
    });
    setDone(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={handleClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-slide-up max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <div>
            <p id="onboarding-title" className="text-base font-bold text-dravik-dark">Add New Agent</p>
            {!done && <p className="text-xs text-gray-400">Step {step} of {STEPS.length}</p>}
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-surface-2 text-gray-400 hover:text-dravik-dark transition-colors">
            <X size={16} />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={28} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-dravik-dark">Agent Added!</p>
              <p className="text-sm text-gray-500 mt-1">
                {data.firstName} {data.lastName} has been added with Onboarding status.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gold text-dravik-dark text-sm font-bold rounded-xl hover:bg-gold-dark transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-0 px-6 py-4 border-b border-line flex-shrink-0">
              {STEPS.map((s, i) => {
                const Icon     = s.icon;
                const isDone   = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-semibold",
                      isActive ? "text-gold" : isDone ? "text-emerald-600" : "text-gray-300"
                    )}>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        isActive ? "bg-gold text-dravik-dark" :
                        isDone   ? "bg-emerald-100 text-emerald-600" :
                                   "bg-surface-2 text-gray-300"
                      )}>
                        {isDone ? <Check size={10} /> : <Icon size={10} />}
                      </div>
                      <span className="hidden sm:block leading-tight">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn("flex-1 h-px mx-2", step > s.id ? "bg-emerald-200" : "bg-line")} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 1 && <StepPersonal   data={data} set={set} />}
              {step === 2 && <StepLicensing  data={data} set={set} />}
              {step === 3 && <StepCommission data={data} set={set} />}
              {step === 4 && <StepReview     data={data} />}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-line flex-shrink-0">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-dravik-dark disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={15} /> Back
              </button>
              {step < STEPS.length ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gold text-dravik-dark text-sm font-bold rounded-xl hover:bg-gold-dark transition-colors"
                >
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-dravik-dark text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Check size={15} /> Add Agent
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
