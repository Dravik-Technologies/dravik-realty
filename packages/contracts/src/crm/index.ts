export * from "./lead";
export * from "./communication";
export * from "./prospecting";
// Both lead.ts and prospecting.ts export a `LeadStatus`. The pipeline statuses in
// lead.ts are canonical at this surface (its only named importer is LeadPipeline);
// prospecting's variant stays internal to SellerLead.status. Proper rename to
// SellerLeadStatus is deferred to Phase 3 contract hardening.
export type { LeadStatus } from "./lead";
