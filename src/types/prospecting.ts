export type LeadType =
  | "Expired"
  | "FSBO"
  | "FRBO"
  | "Pre-Foreclosure"
  | "Absentee"
  | "High Equity";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Appointment Set"
  | "Not Interested"
  | "Follow Up";

export type CallDisposition =
  | "No Answer"
  | "Left Voicemail"
  | "Not Interested"
  | "Follow Up Later"
  | "Appointment Set"
  | "Removed";

export type SortKey =
  | "address"
  | "leadType"
  | "daysSinceEvent"
  | "estimatedEquity"
  | "motivationScore"
  | "status";

export type SortDir = "asc" | "desc";

export interface SellerLead {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  leadType: LeadType;
  ownerName: string;
  phone: string;
  daysSinceEvent: number;
  listPrice?: number;
  estimatedValue: number;
  mortgageBalance: number;
  estimatedEquity: number; // 0–100 percent
  motivationScore: number; // 0–100
  status: LeadStatus;
  lastContacted?: string; // precomputed display string
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface CallLogEntry {
  id: string;
  leadId: string;
  leadName: string;
  address: string;
  phone: string;
  callTime: string; // precomputed display string (client-only, set on action)
  durationSec: number;
  disposition: CallDisposition;
  notes: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  targetTypes: LeadType[];
  channels: string[];
  touchpoints: number;
  duration: string;
  description: string;
  colorA: string;
  colorB: string;
}

export interface FarmArea {
  id: string;
  name: string;
  leadCount: number;
}
