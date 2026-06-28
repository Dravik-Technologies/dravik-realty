"use client";

import { Users, ChevronRight } from "lucide-react";
import type { Agent, TeamGroup, AgentStatus, LicenseType } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── Badge colours ────────────────────────────────────────────
const STATUS_DOT: Record<AgentStatus, string> = {
  Active:     "bg-emerald-400",
  Inactive:   "bg-gray-300",
  Onboarding: "bg-blue-400",
  Suspended:  "bg-rose-400",
};

const LICENSE_CHIP: Record<LicenseType, string> = {
  RE:       "bg-amber-50  text-amber-700",
  Mortgage: "bg-blue-50   text-blue-700",
  Dual:     "bg-violet-50 text-violet-700",
};

// ─── Agent card (module level) ────────────────────────────────
function AgentCard({
  agent: a,
  isLead,
  onSelect,
}: {
  agent:    Agent;
  isLead?:  boolean;
  onSelect: (a: Agent) => void;
}) {
  return (
    <button
      onClick={() => onSelect(a)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
        isLead
          ? "bg-white border-line shadow-sm hover:border-gold/40 hover:shadow-md w-full"
          : "bg-surface border-line hover:bg-white hover:border-line hover:shadow-sm w-full"
      )}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative"
        style={{ background: a.color }}
      >
        {a.initials}
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
            STATUS_DOT[a.status]
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-axen-dark truncate">{a.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", LICENSE_CHIP[a.licenseType])}>
            {a.licenseType}
          </span>
          <span className="text-[9px] text-gray-400">{a.role}</span>
        </div>
      </div>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ─── Team section (module level) ─────────────────────────────
function TeamSection({
  team,
  lead,
  members,
  onSelect,
}: {
  team:     TeamGroup;
  lead:     Agent | undefined;
  members:  Agent[];
  onSelect: (a: Agent) => void;
}) {
  if (!lead) return null;
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      {/* Team header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border-b border-line">
        <div className="w-2 h-2 rounded-full" style={{ background: team.color }} />
        <p className="text-sm font-bold text-axen-dark">{team.name}</p>
        <span className="text-[10px] text-gray-400 ml-auto">{members.length + 1} members</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Team lead */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Team Lead</p>
          <AgentCard agent={lead} isLead onSelect={onSelect} />
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">Members</p>
            <div className="pl-4 border-l-2 space-y-1.5" style={{ borderColor: team.color + "40" }}>
              {members.map((m) => (
                <AgentCard key={m.id} agent={m} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HierarchyView ────────────────────────────────────────────
interface Props {
  agents:   Agent[];
  teams:    TeamGroup[];
  onSelect: (agent: Agent) => void;
}

export default function HierarchyView({ agents, teams, onSelect }: Props) {
  const byId = Object.fromEntries(agents.map((a) => [a.id, a]));

  // Broker is agents[0] (a1 = Chris)
  const broker = agents.find((a) => a.role === "Broker");

  // Non-"direct" teams only (exclude the broker's own container)
  const displayTeams = teams.filter((t) => t.id !== "direct");

  // Direct agents: reports to broker, not a team lead
  const directAgents = agents.filter(
    (a) => a.managerId === broker?.id && a.role === "Agent"
  );

  return (
    <div className="space-y-6">
      {/* Broker card */}
      {broker && (
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">Broker / Owner</p>
            <AgentCard agent={broker} isLead onSelect={onSelect} />
          </div>
        </div>
      )}

      {/* Connector line */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-line" />
      </div>

      {/* Teams grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayTeams.map((team) => {
          const lead    = byId[team.leadId];
          const members = agents.filter((a) => a.teamId === team.id && a.id !== team.leadId);
          return (
            <TeamSection key={team.id} team={team} lead={lead} members={members} onSelect={onSelect} />
          );
        })}

        {/* Direct agents card */}
        {directAgents.length > 0 && (
          <div className="bg-white rounded-2xl border border-line overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border-b border-line">
              <Users size={13} className="text-gold" />
              <p className="text-sm font-bold text-axen-dark">Direct Reports</p>
              <span className="text-[10px] text-gray-400 ml-auto">{directAgents.length} agents</span>
            </div>
            <div className="p-4 space-y-1.5">
              {directAgents.map((a) => (
                <AgentCard key={a.id} agent={a} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
