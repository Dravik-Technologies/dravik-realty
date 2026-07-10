"use client";

import { useEffect, useRef } from "react";
import { X, MapPin, Star, BadgeCheck } from "lucide-react";
import SplitCalculator from "./SplitCalculator";
import { Agent } from "@dravik/contracts/referrals";
import { cn } from "@dravik/shared";

// ──────────────────────────────────────────────
// Certification badge config
// ──────────────────────────────────────────────
const CERT_CONFIG = {
  "RE Broker":     { bg: "bg-gold-light",  border: "border-gold/50",  text: "text-gold-dark"  },
  "Dual Licensed": { bg: "bg-dravik-dark",   border: "border-dravik-dark", text: "text-white"      },
  "RE + Mortgage": { bg: "bg-gold",        border: "border-gold",      text: "text-white"      },
};

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface ReferralModalProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

export default function ReferralModal({ agent, open, onClose }: ReferralModalProps) {
  const overlayRef    = useRef<HTMLDivElement>(null);
  const modalRef      = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Save return focus, set initial focus inside modal, restore on close
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    const id = requestAnimationFrame(() => {
      modalRef.current?.querySelector<HTMLElement>(
        "button:not([disabled]), [href], input, select, [tabindex]:not([tabindex='-1'])"
      )?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  // Escape + Tab trap
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      ));
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
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !agent) return null;

  const cert = CERT_CONFIG[agent.certification];
  const stars = Math.floor(agent.productionScore);
  const partial = agent.productionScore % 1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(26,26,46,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
        className="animate-slide-up bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow"
              style={{ background: agent.avatarColor }}
            >
              {agent.initials}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="referral-modal-title" className="text-xl font-bold text-dravik-dark">{agent.name}</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                    cert.bg, cert.border, cert.text
                  )}
                >
                  <BadgeCheck size={11} />
                  {agent.certification}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gold" />
                  {agent.location.city}, {agent.location.state}
                </span>
                <span className="text-line">|</span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < stars
                          ? "fill-gold text-gold"
                          : i === stars && partial >= 0.5
                          ? "fill-gold/50 text-gold"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                  <span className="font-semibold text-dravik-dark ml-0.5">
                    {agent.productionScore.toFixed(1)}
                  </span>
                  <span className="text-gray-400">({agent.totalReviews})</span>
                </span>
                <span className="text-line">|</span>
                <span>{agent.yearsExperience} yrs exp.</span>
              </div>
            </div>
          </div>

          <button
            aria-label="Close referral calculator"
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-gray-400 hover:text-dravik-dark flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Agent stats strip ── */}
        <div className="grid grid-cols-4 divide-x divide-line border-b border-line flex-shrink-0">
          {[
            { label: "Closed Vol. (MTD)", value: agent.closedVolumeMTD },
            { label: "Transactions",      value: agent.closedTransactions },
            { label: "Avg Days to Close", value: agent.avgDaysToClose },
            { label: "Active Listings",   value: agent.activeListings },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3 text-center">
              <p className="text-lg font-bold text-dravik-dark">{value}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Calculator section ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-dravik-dark flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gold inline-block" />
              Dravik Cut — Split Calculator
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Adjust the sliders to model your referral payout in real time.
            </p>
          </div>

          <SplitCalculator agent={agent} />
        </div>

        {/* ── Footer CTA ── */}
        <div className="px-7 py-5 border-t border-line bg-surface flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400">
            Sending referral to <span className="font-semibold text-dravik-dark">{agent.name}</span> · {agent.location.city}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-line text-gray-600 hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button className="px-6 py-2.5 text-sm font-bold rounded-xl bg-dravik-dark text-white hover:bg-dravik-navy transition-colors shadow-md">
              Send Referral Agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
