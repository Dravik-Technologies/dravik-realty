export type CertificationType = "RE Broker" | "Dual Licensed" | "RE + Mortgage" | "Mortgage Lender";
export type PartnerRole = "Real Estate Agent" | "Mortgage Lender" | "Dual Service";
export type ReferralStatus = "Pending" | "Accepted" | "Under Contract" | "Closed";
export type Specialization =
  | "Luxury"
  | "Commercial"
  | "Residential"
  | "Investment"
  | "First-Time Buyers"
  | "New Construction"
  | "VA Loans"
  | "FHA Loans"
  | "Jumbo Loans"
  | "Conventional Loans";
export type Region =
  | "Northeast"
  | "Southeast"
  | "Midwest"
  | "Southwest"
  | "West"
  | "Pacific Northwest";

export interface AgentLocation {
  city: string;
  state: string;
  region: Region;
  avgPropertyValue: number;
  lat?: number;
  lng?: number;
}

export interface Agent {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  partnerRole: PartnerRole;
  certification: CertificationType;
  specializations: Specialization[];
  location: AgentLocation;
  productionScore: number;   // out of 5.0
  totalReviews: number;
  closedVolumeMTD: string;   // e.g. "$4.2M"
  closedTransactions: number;
  avgDaysToClose: number;
  activeListings: number;
  email: string;
  phone: string;
  bio: string;
  yearsExperience: number;
}

export interface ReferralPipeline {
  id: string;
  clientName: string;
  agentId: string;
  agentName: string;
  agentCity: string;
  status: ReferralStatus;
  propertyValue: number;
  referralFee: number;       // percentage
  estimatedEarning: number;  // dollar amount
  dateInitiated: string;
  lastUpdate: string;
  propertyType: string;
}

export interface SplitBreakdown {
  totalCommission: number;
  receivingAgentShare: number;
  referringAgentGross: number;
  dravikCut: number;
  referringAgentNet: number;
}
