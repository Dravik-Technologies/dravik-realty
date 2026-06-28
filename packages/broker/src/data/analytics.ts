import type { AnalyticsData, AgentStat, ReferralPartner, CampaignStat } from "@dravik/contracts/broker";

// ─── Shared reference data (same across periods) ──────────────
const AGENTS: AgentStat[] = [
  { id: "a1", name: "Chris Macabugao", initials: "CM", color: "#D4AF37", closedVolume: 22_400_000, transactions: 28, gci: 672_000, avgDaysToClose: 38, conversionRate: 20 },
  { id: "a2", name: "Sarah Chen",       initials: "SC", color: "#3B82F6", closedVolume: 18_200_000, transactions: 22, gci: 546_000, avgDaysToClose: 42, conversionRate: 18 },
  { id: "a3", name: "Marcus Rivera",    initials: "MR", color: "#10B981", closedVolume: 15_600_000, transactions: 19, gci: 468_000, avgDaysToClose: 45, conversionRate: 15 },
  { id: "a4", name: "Jessica Park",     initials: "JP", color: "#8B5CF6", closedVolume: 11_800_000, transactions: 15, gci: 354_000, avgDaysToClose: 52, conversionRate: 13 },
  { id: "a5", name: "David Thompson",   initials: "DT", color: "#F59E0B", closedVolume:  9_200_000, transactions: 12, gci: 276_000, avgDaysToClose: 58, conversionRate: 11 },
];

const REFERRAL_PARTNERS: ReferralPartner[] = [
  { id: "r1", name: "Maria Santos",      type: "agent",   sent: 8,  received: 5,  closed: 11, totalFees: 82_500 },
  { id: "r2", name: "Premier Realty Co", type: "company", sent: 5,  received: 3,  closed:  6, totalFees: 45_000 },
  { id: "r3", name: "James Wilson",      type: "client",  sent: 0,  received: 4,  closed:  4, totalFees: 30_000 },
  { id: "r4", name: "Sunrise Title",     type: "company", sent: 0,  received: 12, closed: 10, totalFees:      0 },
  { id: "r5", name: "Roberto Blanco",    type: "agent",   sent: 4,  received: 2,  closed:  4, totalFees: 28_000 },
];

const CAMPAIGNS: CampaignStat[] = [
  { id: "c1", name: "Coral Gables Luxury",  type: "Landing Page",   color: "#D4AF37", leads: 42, cost: 2_400, conversions: 4 },
  { id: "c2", name: "Miami Beach Buyers",   type: "Email Campaign", color: "#3B82F6", leads: 38, cost:   600, conversions: 3 },
  { id: "c3", name: "Brickell Investment",  type: "Social Media",   color: "#8B5CF6", leads: 65, cost: 3_800, conversions: 5 },
  { id: "c4", name: "First-Time Buyers",    type: "Webinar",        color: "#10B981", leads: 28, cost: 1_100, conversions: 5 },
  { id: "c5", name: "Luxury Listings",      type: "Print/Digital",  color: "#F59E0B", leads: 18, cost: 4_200, conversions: 2 },
];

// ─── Year (Jan–Dec 2025) ──────────────────────────────────────
const YEAR_DATA: AnalyticsData["year"] = {
  teamVolume:           77_200_000,
  teamGci:              2_316_000,
  teamTransactions:     96,
  teamConversionRate:   16,
  teamAvgDaysToClose:   45,
  teamReferralRevenue:  185_500,
  teamMortgageRevenue:  420_000,
  agentReferralRevenue:  54_000,
  agentMortgageRevenue: 120_000,

  timeSeries: [
    { label: "Jan", volume: 4_200_000,  transactions: 5,  gci: 126_000 },
    { label: "Feb", volume: 3_800_000,  transactions: 4,  gci: 114_000 },
    { label: "Mar", volume: 5_600_000,  transactions: 7,  gci: 168_000 },
    { label: "Apr", volume: 7_200_000,  transactions: 9,  gci: 216_000 },
    { label: "May", volume: 8_400_000,  transactions: 10, gci: 252_000 },
    { label: "Jun", volume: 9_100_000,  transactions: 11, gci: 273_000 },
    { label: "Jul", volume: 6_800_000,  transactions: 8,  gci: 204_000 },
    { label: "Aug", volume: 7_600_000,  transactions: 9,  gci: 228_000 },
    { label: "Sep", volume: 8_200_000,  transactions: 10, gci: 246_000 },
    { label: "Oct", volume: 9_400_000,  transactions: 11, gci: 282_000 },
    { label: "Nov", volume: 7_800_000,  transactions: 9,  gci: 234_000 },
    { label: "Dec", volume: 5_400_000,  transactions: 6,  gci: 162_000 },
  ],

  leadSources: [
    { source: "Referral",      color: "#D4AF37", leads: 38,  contacted: 30, underContract: 16, closed: 12 },
    { source: "Zillow",        color: "#FF6200", leads: 65,  contacted: 42, underContract: 10, closed:  6 },
    { source: "Website",       color: "#3B82F6", leads: 28,  contacted: 18, underContract:  7, closed:  4 },
    { source: "Social Media",  color: "#8B5CF6", leads: 48,  contacted: 22, underContract:  6, closed:  3 },
    { source: "Cold Outreach", color: "#6B7280", leads: 35,  contacted: 15, underContract:  5, closed:  2 },
    { source: "Walk-in",       color: "#10B981", leads: 12,  contacted: 10, underContract:  5, closed:  3 },
  ],

  funnel: [
    { stage: "New Leads",       count: 226, color: "#3B82F6" },
    { stage: "Contacted",       count: 137, color: "#6366F1" },
    { stage: "Qualified",       count:  68, color: "#8B5CF6" },
    { stage: "Under Contract",  count:  44, color: "#D4AF37" },
    { stage: "Closed",          count:  28, color: "#10B981" },
  ],

  agents: AGENTS,

  referralPartners: REFERRAL_PARTNERS,
  referralsSent:            17,
  referralsReceived:        26,
  referralSuccessRate:      60,
  avgReferralFee:        9_750,
  agentReferralsSent:        5,
  agentReferralsReceived:    8,
  agentReferralSuccessRate: 62,
  agentAvgReferralFee:  10_800,

  campaigns: CAMPAIGNS,

  mortgageMonths: [
    { month: "Jan", preQuals:  8, applications: 6, approvals: 5, funded: 4, avgLoanSize: 820_000, avgRate: 6.75 },
    { month: "Feb", preQuals:  7, applications: 5, approvals: 4, funded: 3, avgLoanSize: 750_000, avgRate: 6.80 },
    { month: "Mar", preQuals:  9, applications: 7, approvals: 6, funded: 5, avgLoanSize: 890_000, avgRate: 6.85 },
    { month: "Apr", preQuals: 11, applications: 8, approvals: 7, funded: 6, avgLoanSize: 810_000, avgRate: 7.00 },
    { month: "May", preQuals: 10, applications: 8, approvals: 6, funded: 5, avgLoanSize: 870_000, avgRate: 7.10 },
    { month: "Jun", preQuals: 12, applications: 9, approvals: 8, funded: 7, avgLoanSize: 940_000, avgRate: 7.15 },
    { month: "Jul", preQuals:  8, applications: 6, approvals: 5, funded: 4, avgLoanSize: 780_000, avgRate: 7.05 },
    { month: "Aug", preQuals:  9, applications: 7, approvals: 6, funded: 5, avgLoanSize: 820_000, avgRate: 6.95 },
    { month: "Sep", preQuals: 10, applications: 8, approvals: 7, funded: 6, avgLoanSize: 860_000, avgRate: 6.80 },
    { month: "Oct", preQuals: 11, applications: 9, approvals: 8, funded: 7, avgLoanSize: 910_000, avgRate: 6.75 },
    { month: "Nov", preQuals:  9, applications: 7, approvals: 6, funded: 5, avgLoanSize: 830_000, avgRate: 6.70 },
    { month: "Dec", preQuals:  7, applications: 5, approvals: 4, funded: 3, avgLoanSize: 760_000, avgRate: 6.65 },
  ],
  mortgageConversionRate:      55,
  avgLoanSize:            837_000,
  avgRate:                  6.88,
  agentMortgageConversionRate: 58,
  agentAvgLoanSize:       895_000,
  agentAvgRate:             6.85,
};

// ─── Quarter (Apr–Jun 2025) ───────────────────────────────────
const QUARTER_DATA: AnalyticsData["quarter"] = {
  teamVolume:          24_700_000,
  teamGci:               741_000,
  teamTransactions:           30,
  teamConversionRate:         18,
  teamAvgDaysToClose:         41,
  teamReferralRevenue:    52_000,
  teamMortgageRevenue:   118_000,
  agentReferralRevenue:  15_500,
  agentMortgageRevenue:  34_500,

  timeSeries: [
    { label: "April", volume: 7_200_000, transactions: 9,  gci: 216_000 },
    { label: "May",   volume: 8_400_000, transactions: 10, gci: 252_000 },
    { label: "June",  volume: 9_100_000, transactions: 11, gci: 273_000 },
  ],

  leadSources: [
    { source: "Referral",      color: "#D4AF37", leads: 12, contacted:  9, underContract: 5, closed: 4 },
    { source: "Zillow",        color: "#FF6200", leads: 18, contacted: 12, underContract: 3, closed: 2 },
    { source: "Website",       color: "#3B82F6", leads:  8, contacted:  5, underContract: 2, closed: 1 },
    { source: "Social Media",  color: "#8B5CF6", leads: 14, contacted:  6, underContract: 2, closed: 1 },
    { source: "Cold Outreach", color: "#6B7280", leads:  9, contacted:  4, underContract: 1, closed: 1 },
    { source: "Walk-in",       color: "#10B981", leads:  4, contacted:  3, underContract: 2, closed: 1 },
  ],

  funnel: [
    { stage: "New Leads",      count: 65, color: "#3B82F6" },
    { stage: "Contacted",      count: 39, color: "#6366F1" },
    { stage: "Qualified",      count: 20, color: "#8B5CF6" },
    { stage: "Under Contract", count: 15, color: "#D4AF37" },
    { stage: "Closed",         count: 10, color: "#10B981" },
  ],

  agents: AGENTS.map((a) => ({ ...a, closedVolume: Math.round(a.closedVolume * 0.32), transactions: Math.round(a.transactions * 0.3), gci: Math.round(a.gci * 0.32) })),

  referralPartners: REFERRAL_PARTNERS.map((r) => ({ ...r, sent: Math.round(r.sent * 0.3), received: Math.round(r.received * 0.3), closed: Math.round(r.closed * 0.3), totalFees: Math.round(r.totalFees * 0.3) })),
  referralsSent:            5,
  referralsReceived:        8,
  referralSuccessRate:     62,
  avgReferralFee:       9_800,
  agentReferralsSent:       2,
  agentReferralsReceived:   3,
  agentReferralSuccessRate: 65,
  agentAvgReferralFee:  10_500,

  campaigns: CAMPAIGNS.map((c) => ({ ...c, leads: Math.round(c.leads * 0.3), conversions: Math.round(c.conversions * 0.3) })),

  mortgageMonths: [
    { month: "Apr", preQuals: 11, applications: 8, approvals: 7, funded: 6, avgLoanSize: 810_000, avgRate: 7.00 },
    { month: "May", preQuals: 10, applications: 8, approvals: 6, funded: 5, avgLoanSize: 870_000, avgRate: 7.10 },
    { month: "Jun", preQuals: 12, applications: 9, approvals: 8, funded: 7, avgLoanSize: 940_000, avgRate: 7.15 },
  ],
  mortgageConversionRate:      58,
  avgLoanSize:            873_000,
  avgRate:                  7.08,
  agentMortgageConversionRate: 62,
  agentAvgLoanSize:       910_000,
  agentAvgRate:             7.05,
};

// ─── 30 days (last 4 weeks) ───────────────────────────────────
const MONTH_DATA: AnalyticsData["30d"] = {
  teamVolume:           8_100_000,
  teamGci:                243_000,
  teamTransactions:            10,
  teamConversionRate:          21,
  teamAvgDaysToClose:          35,
  teamReferralRevenue:     17_500,
  teamMortgageRevenue:     38_000,
  agentReferralRevenue:    5_000,
  agentMortgageRevenue:   11_500,

  timeSeries: [
    { label: "Week 1", volume: 1_800_000, transactions: 2, gci: 54_000 },
    { label: "Week 2", volume: 2_400_000, transactions: 3, gci: 72_000 },
    { label: "Week 3", volume: 2_250_000, transactions: 3, gci: 67_500 },
    { label: "Week 4", volume: 1_650_000, transactions: 2, gci: 49_500 },
  ],

  leadSources: [
    { source: "Referral",      color: "#D4AF37", leads:  4, contacted: 3, underContract: 2, closed: 2 },
    { source: "Zillow",        color: "#FF6200", leads:  6, contacted: 4, underContract: 1, closed: 1 },
    { source: "Website",       color: "#3B82F6", leads:  3, contacted: 2, underContract: 1, closed: 0 },
    { source: "Social Media",  color: "#8B5CF6", leads:  5, contacted: 2, underContract: 1, closed: 0 },
    { source: "Cold Outreach", color: "#6B7280", leads:  3, contacted: 1, underContract: 0, closed: 0 },
    { source: "Walk-in",       color: "#10B981", leads:  1, contacted: 1, underContract: 1, closed: 1 },
  ],

  funnel: [
    { stage: "New Leads",      count: 22, color: "#3B82F6" },
    { stage: "Contacted",      count: 13, color: "#6366F1" },
    { stage: "Qualified",      count:  7, color: "#8B5CF6" },
    { stage: "Under Contract", count:  6, color: "#D4AF37" },
    { stage: "Closed",         count:  4, color: "#10B981" },
  ],

  agents: AGENTS.map((a) => ({ ...a, closedVolume: Math.round(a.closedVolume * 0.105), transactions: Math.max(1, Math.round(a.transactions * 0.1)), gci: Math.round(a.gci * 0.105) })),

  referralPartners: REFERRAL_PARTNERS.map((r) => ({ ...r, sent: Math.round(r.sent * 0.1), received: Math.round(r.received * 0.1), closed: Math.max(0, Math.round(r.closed * 0.1)), totalFees: Math.round(r.totalFees * 0.1) })),
  referralsSent:            2,
  referralsReceived:        3,
  referralSuccessRate:     67,
  avgReferralFee:       9_500,
  agentReferralsSent:       1,
  agentReferralsReceived:   1,
  agentReferralSuccessRate: 67,
  agentAvgReferralFee:  10_200,

  campaigns: CAMPAIGNS.map((c) => ({ ...c, leads: Math.max(1, Math.round(c.leads * 0.1)), conversions: Math.max(0, Math.round(c.conversions * 0.1)) })),

  mortgageMonths: [
    { month: "Wk 1", preQuals: 3, applications: 2, approvals: 2, funded: 1, avgLoanSize: 880_000, avgRate: 6.88 },
    { month: "Wk 2", preQuals: 3, applications: 3, approvals: 2, funded: 2, avgLoanSize: 920_000, avgRate: 6.85 },
    { month: "Wk 3", preQuals: 4, applications: 3, approvals: 3, funded: 2, avgLoanSize: 840_000, avgRate: 6.90 },
    { month: "Wk 4", preQuals: 2, applications: 2, approvals: 2, funded: 1, avgLoanSize: 790_000, avgRate: 6.87 },
  ],
  mortgageConversionRate:      60,
  avgLoanSize:            857_000,
  avgRate:                  6.88,
  agentMortgageConversionRate: 60,
  agentAvgLoanSize:       890_000,
  agentAvgRate:             6.86,
};

export const ANALYTICS_DATA: AnalyticsData = {
  year:    YEAR_DATA,
  quarter: QUARTER_DATA,
  "30d":   MONTH_DATA,
  custom:  YEAR_DATA,
};
