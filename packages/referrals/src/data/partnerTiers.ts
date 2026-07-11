import type { Agent } from "@dravik/contracts/referrals";

export type PartnerTier = "App Subscriber" | "Network Partner";

const SUBSCRIBER_AGENT_IDS = new Set(["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a14", "a19", "a20"]);

export function getPartnerTier(agent: Agent): PartnerTier {
  return SUBSCRIBER_AGENT_IDS.has(agent.id) ? "App Subscriber" : "Network Partner";
}

export function getPartnerTierLabel(tier: PartnerTier, compact = false): string {
  if (tier === "App Subscriber") return compact ? "Subscriber" : "App Subscriber";
  return compact ? "Network" : "Network Partner";
}

export function getPartnerTierStyles(tier: PartnerTier): { bg: string; text: string; border: string } {
  return tier === "App Subscriber"
    ? { bg: "#111418", text: "#C9C3B6", border: "#111418" }
    : { bg: "#F1F0EC", text: "#767E88", border: "#DDE2E8" };
}
