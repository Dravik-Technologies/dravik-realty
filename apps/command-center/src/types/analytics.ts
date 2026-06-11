export type DateRange  = "30d" | "quarter" | "year" | "custom";
export type ViewMode   = "agent" | "broker";
export type ReportTab  = "production" | "leads" | "referrals" | "marketing" | "mortgage";

export interface TimeSeriesPoint {
  label: string;
  volume: number;
  transactions: number;
  gci: number;
}

export interface LeadSourceStat {
  source: string;
  color: string;
  leads: number;
  contacted: number;
  underContract: number;
  closed: number;
}

export interface FunnelStep {
  stage: string;
  count: number;
  color: string;
}

export interface AgentStat {
  id: string;
  name: string;
  initials: string;
  color: string;
  closedVolume: number;
  transactions: number;
  gci: number;
  avgDaysToClose: number;
  conversionRate: number;
}

export interface ReferralPartner {
  id: string;
  name: string;
  type: "agent" | "client" | "company";
  sent: number;
  received: number;
  closed: number;
  totalFees: number;
}

export interface CampaignStat {
  id: string;
  name: string;
  type: string;
  color: string;
  leads: number;
  cost: number;
  conversions: number;
}

export interface MortgageMonthStat {
  month: string;
  preQuals: number;
  applications: number;
  approvals: number;
  funded: number;
  avgLoanSize: number;
  avgRate: number;
}

export interface AnalyticsSnapshot {
  // Top-line KPIs — team totals (broker) or personal (agent) depending on viewMode
  teamVolume: number;
  teamGci: number;
  teamTransactions: number;
  teamConversionRate: number;
  teamAvgDaysToClose: number;
  teamReferralRevenue:  number;
  teamMortgageRevenue:  number;
  agentReferralRevenue: number;
  agentMortgageRevenue: number;

  timeSeries: TimeSeriesPoint[];
  leadSources: LeadSourceStat[];
  funnel: FunnelStep[];
  agents: AgentStat[];           // agents[0] = current user

  referralPartners: ReferralPartner[];
  referralsSent: number;
  referralsReceived: number;
  referralSuccessRate: number;
  avgReferralFee: number;
  agentReferralsSent:       number;
  agentReferralsReceived:   number;
  agentReferralSuccessRate: number;
  agentAvgReferralFee:      number;

  campaigns: CampaignStat[];

  mortgageMonths: MortgageMonthStat[];
  mortgageConversionRate:      number;
  avgLoanSize:                 number;
  avgRate:                     number;
  agentMortgageConversionRate: number;
  agentAvgLoanSize:            number;
  agentAvgRate:                number;
}

export type AnalyticsData = Record<DateRange, AnalyticsSnapshot>;
