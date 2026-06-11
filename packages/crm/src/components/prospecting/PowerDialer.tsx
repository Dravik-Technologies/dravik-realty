"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  Mail,
  Mic,
  MicOff,
  Pause,
  Phone,
  PhoneOff,
  RotateCcw,
  SkipForward,
  UserRound,
} from "lucide-react";
import type { CallDisposition, CallLogEntry, SellerLead } from "@dravik/contracts/crm";
import { cn } from "@dravik/shared";

const DISPOSITIONS: CallDisposition[] = [
  "No Answer",
  "Left Voicemail",
  "Not Interested",
  "Follow Up Later",
  "Appointment Set",
  "Removed",
];

const DIAL_PAD = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
] as const;

type DialerMode = "idle" | "dialing" | "connected" | "wrapup";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function QueueRow({
  lead,
  selected,
  onSelect,
  onRemove,
}: {
  lead: SellerLead;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 border-b border-line transition-colors",
        selected ? "bg-gold-light/40" : "hover:bg-surface"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-axen-dark text-gold flex items-center justify-center flex-shrink-0">
          <UserRound size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-axen-dark truncate">{lead.ownerName}</p>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{lead.address}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 text-gray-500">
              {lead.leadType}
            </span>
            <span className="text-[10px] font-semibold text-gold">{lead.motivationScore} score</span>
          </div>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="text-[10px] font-semibold text-gray-400 hover:text-rose-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </button>
  );
}

interface PowerDialerProps {
  queue: SellerLead[];
  onToggleQueue: (id: string) => void;
}

export default function PowerDialer({ queue, onToggleQueue }: PowerDialerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const [dialerMode, setDialerMode] = useState<DialerMode>("idle");
  const [manualDigits, setManualDigits] = useState("");
  const [muted, setMuted] = useState(false);
  const [notes, setNotes] = useState("");
  const [durationSec, setDurationSec] = useState(0);
  const [logs, setLogs] = useState<CallLogEntry[]>([]);
  const nextLogId = useRef(1);

  const activeSelectedId = useMemo(() => {
    if (!queue.length) return null;
    if (selectedId && queue.some((lead) => lead.id === selectedId)) return selectedId;
    return queue[0].id;
  }, [queue, selectedId]);

  const selectedLead = useMemo(
    () => queue.find((lead) => lead.id === activeSelectedId) ?? null,
    [queue, activeSelectedId]
  );

  const digits = manualDigits || selectedLead?.phone || "";

  useEffect(() => {
    if (dialerMode !== "connected") return;
    const interval = window.setInterval(() => {
      setDurationSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [dialerMode]);

  function appendDigit(value: string) {
    setManualDigits((prev) => `${prev || selectedLead?.phone || ""}${value}`);
  }

  function resetComposerState() {
    setManualDigits("");
    setNotes("");
    setMuted(false);
    setDurationSec(0);
  }

  function handleSelectLead(id: string) {
    setSelectedId(id);
    setDialerMode("idle");
    resetComposerState();
  }

  function startCall() {
    if (!selectedLead && !digits.trim()) return;
    setDialerMode("dialing");
    setDurationSec(0);

    window.setTimeout(() => {
      setDialerMode("connected");
    }, 800);
  }

  function endCall() {
    if (dialerMode === "idle") return;
    setDialerMode("wrapup");
  }

  function resetCall() {
    setDialerMode("idle");
    resetComposerState();
  }

  function advanceQueue(currentLeadId: string) {
    const currentIndex = queue.findIndex((lead) => lead.id === currentLeadId);
    onToggleQueue(currentLeadId);

    if (queue.length <= 1) {
      setSelectedId(null);
      setDialerMode("idle");
      resetComposerState();
      return;
    }

    const nextLead = queue[currentIndex + 1] ?? queue[currentIndex - 1] ?? queue[0];
    setSelectedId(nextLead.id);
    setDialerMode("idle");
    resetComposerState();
  }

  function logDisposition(disposition: CallDisposition) {
    if (!selectedLead) return;

    const entry: CallLogEntry = {
      id: `call-${nextLogId.current++}`,
      leadId: selectedLead.id,
      leadName: selectedLead.ownerName,
      address: selectedLead.address,
      phone: selectedLead.phone,
      callTime: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      durationSec,
      disposition,
      notes: notes.trim(),
    };

    setLogs((prev) => [entry, ...prev]);
    advanceQueue(selectedLead.id);
  }

  return (
    <div className="min-h-full grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
      <aside className="bg-white border-b xl:border-b-0 xl:border-r border-line flex flex-col min-h-[280px] xl:min-h-0">
        <div className="px-4 py-4 border-b border-line">
          <p className="text-sm font-bold text-axen-dark">Call Queue</p>
          <p className="text-[11px] text-gray-400 mt-1">{queue.length} seller lead{queue.length === 1 ? "" : "s"} ready</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Phone size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-axen-dark">No leads queued yet</p>
                <p className="text-sm text-gray-400 mt-1">Add prospects from Seller Leads or a Geo Farm list to start dialing.</p>
              </div>
              <Link href="/prospecting" className="text-sm font-semibold text-gold hover:text-gold-dark">
                Go back to Seller Leads
              </Link>
            </div>
          ) : (
            queue.map((lead) => (
              <QueueRow
                key={lead.id}
                lead={lead}
                selected={lead.id === activeSelectedId}
                onSelect={() => handleSelectLead(lead.id)}
                onRemove={() => onToggleQueue(lead.id)}
              />
            ))
          )}
        </div>
      </aside>

      <section className="bg-surface px-4 md:px-6 py-5 flex flex-col gap-5 min-h-[640px]">
        <div className="bg-white rounded-2xl border border-line p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Prospect</p>
            {selectedLead ? (
              <>
                <p className="text-lg font-bold text-axen-dark">{selectedLead.ownerName}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedLead.address} · {selectedLead.phone}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-axen-dark">Manual Dial</p>
                <p className="text-xs text-gray-400 mt-1">Use the dial pad to call a custom number.</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/inbox"
              className="flex items-center gap-2 px-3 py-2 border border-line rounded-xl text-xs font-semibold text-gray-500 hover:text-gold hover:border-gold transition-colors"
            >
              <Mail size={13} />
              Inbox Log
            </Link>
            <div className="px-3 py-2 rounded-xl bg-gold-light border border-gold/30">
              <p className="text-[10px] font-bold text-gold-dark uppercase tracking-widest">Status</p>
              <p className="text-xs font-semibold text-axen-dark capitalize mt-0.5">{dialerMode}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-line shadow-sm p-5 md:p-6 flex-1 flex flex-col">
          <div className="text-center mb-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Power Dialer</p>
            <p className="text-3xl md:text-4xl font-bold text-axen-dark tracking-[0.08em]">{digits || "Enter number"}</p>
            <p className="text-sm text-gray-400 mt-2">
              {dialerMode === "connected"
                ? `Live call · ${formatDuration(durationSec)}`
                : dialerMode === "dialing"
                  ? "Connecting..."
                  : dialerMode === "wrapup"
                    ? "Select a disposition to log the call"
                    : "Ready to dial"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto w-full">
            {DIAL_PAD.map(([digit, letters]) => (
              <button
                key={digit}
                onClick={() => appendDigit(digit)}
                className="aspect-square rounded-2xl bg-surface border border-line hover:border-gold hover:bg-gold-light transition-all flex flex-col items-center justify-center"
              >
                <span className="text-2xl font-bold text-axen-dark leading-none">{digit}</span>
                <span className="text-[10px] font-semibold text-gray-400 mt-1">{letters}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setMuted((prev) => !prev)}
              disabled={dialerMode === "idle" || dialerMode === "dialing"}
              className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-colors",
                dialerMode === "idle" || dialerMode === "dialing"
                  ? "border-line text-gray-300 cursor-not-allowed"
                  : "border-line text-gray-500 hover:text-gold hover:border-gold"
              )}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={() => {
                if (dialerMode === "idle") startCall();
                else endCall();
              }}
              className={cn(
                "px-7 h-14 rounded-full text-base font-bold transition-colors shadow-sm",
                dialerMode === "idle"
                  ? "bg-gold text-axen-dark hover:bg-gold-dark"
                  : "bg-rose-500 text-white hover:bg-rose-600"
              )}
            >
              <span className="flex items-center gap-2">
                {dialerMode === "idle" ? <Phone size={18} /> : <PhoneOff size={18} />}
                {dialerMode === "idle" ? "Call" : "End Call"}
              </span>
            </button>
            <button
              onClick={() => setDialerMode((prev) => (prev === "connected" ? "dialing" : "connected"))}
              disabled={dialerMode !== "connected" && dialerMode !== "dialing"}
              className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-colors",
                dialerMode !== "connected" && dialerMode !== "dialing"
                  ? "border-line text-gray-300 cursor-not-allowed"
                  : "border-line text-gray-500 hover:text-gold hover:border-gold"
              )}
            >
              <Pause size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-4 mt-6">
            <div className="rounded-2xl bg-surface p-4 border border-line">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm font-bold text-axen-dark">Call Notes</p>
                <span className="text-[10px] font-semibold text-gray-400">Auto-logged to Activity + Inbox</span>
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Capture seller objections, price position, timing, or next steps..."
                className="w-full h-28 resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-axen-dark placeholder:text-gray-300 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="rounded-2xl bg-axen-dark p-4 text-white flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Session Controls</p>
                <p className="text-sm text-gray-300">Keep the cadence moving and auto-advance to the next prospect when a call is logged.</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => selectedLead && advanceQueue(selectedLead.id)}
                  disabled={!selectedLead}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SkipForward size={15} />
                  Skip Lead
                </button>
                <button
                  onClick={resetCall}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors"
                >
                  <RotateCcw size={15} />
                  Reset Dialer
                </button>
              </div>
            </div>
          </div>

          {dialerMode === "wrapup" && (
            <div className="mt-6 rounded-2xl border border-gold/30 bg-gold-light p-4">
              <p className="text-sm font-bold text-axen-dark mb-3">Post-call Disposition</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DISPOSITIONS.map((disposition) => (
                  <button
                    key={disposition}
                    onClick={() => logDisposition(disposition)}
                    className="px-3 py-2 rounded-xl bg-white border border-gold/20 text-sm font-semibold text-axen-dark hover:border-gold hover:text-gold transition-colors"
                  >
                    {disposition}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="bg-white border-t xl:border-t-0 xl:border-l border-line flex flex-col min-h-[280px] xl:min-h-0">
        <div className="px-4 py-4 border-b border-line">
          <p className="text-sm font-bold text-axen-dark">Session Activity</p>
          <p className="text-[11px] text-gray-400 mt-1">Live call log synced to the workflow timeline</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Clock3 size={20} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-axen-dark">No calls logged yet</p>
                <p className="text-sm text-gray-400 mt-1">Dispositioned calls will appear here and can be reviewed in the Unified Inbox.</p>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="px-4 py-3 border-b border-line">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-axen-dark truncate">{log.leadName}</p>
                  <span className="text-[10px] text-gray-400">{log.callTime}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 truncate">{log.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-light text-gold-dark border border-gold/20">
                    {log.disposition}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatDuration(log.durationSec)}</span>
                </div>
                {log.notes && (
                  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{log.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
