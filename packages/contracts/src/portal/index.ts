export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AgentContact {
  name: string;
  title: string;
  phone: string;
  email: string;
  license: string;
  initials: string;
}

export type ClientDocStatus = "signed" | "pending" | "needed";
export type ClientDocType = "contract" | "inspection" | "appraisal" | "disclosure" | "title" | "loan" | "id" | "bank";

export interface ClientDocument {
  id: string;
  name: string;
  type: ClientDocType;
  status: ClientDocStatus;
  uploadedAt?: string;
  dueDate?: string;
  transactionId?: string;
}

export type MortgageStatus =
  | "Pre-Approval"
  | "Application Submitted"
  | "Processing"
  | "Underwriting"
  | "Conditional Approval"
  | "Clear to Close"
  | "Funded";

export interface ClientMortgage {
  id: string;
  lender: string;
  status: MortgageStatus;
  approvedAmount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  loanType: string;
  downPayment: number;
  closingCostEstimate: number;
  documentsNeeded: string[];
  lastUpdated: string;
  transactionId: string;
}

export type ClientTxStage =
  | "Under Contract"
  | "Inspections"
  | "Financing Approved"
  | "Appraisal / Title"
  | "Closing / Funded"
  | "Closed";

export interface ClientTransaction {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  heroImage: string;
  contractPrice: number;
  listPrice: number;
  status: "Active" | "Closed" | "Cancelled";
  stage: ClientTxStage;
  progress: number;
  type: "Buy" | "Sell" | "Dual";
  contractDate: string;
  closingDate: string;
  daysUntilClose: number;
  nextStep: string;
  agent: AgentContact;
  documents: ClientDocument[];
  mortgage?: ClientMortgage;
  mlsNumber?: string;
}

export interface SavedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  heroImage: string;
  savedAt: string;
  status: "Active" | "Pending" | "Sold";
  notes?: string;
  pricePerSqft: number;
  yearBuilt: number;
}

export type ActivityActor = "agent" | "client" | "system";
export type ActivityType = "note" | "document" | "status" | "message" | "showing" | "milestone";

export interface ActivityEntry {
  id: string;
  date: string;
  actor: string;
  actorRole: ActivityActor;
  message: string;
  type: ActivityType;
}

export interface ClientMessage {
  id: string;
  from: "agent" | "client";
  fromName: string;
  content: string;
  timestamp: string;
  displayTime: string;
  read: boolean;
}

export interface ClientPortalData {
  client: ClientUser;
  agent: AgentContact;
  transactions: ClientTransaction[];
  savedProperties: SavedProperty[];
  messages: ClientMessage[];
  activity: ActivityEntry[];
}

export const MORTGAGE_STAGES: MortgageStatus[] = [
  "Pre-Approval",
  "Application Submitted",
  "Processing",
  "Underwriting",
  "Conditional Approval",
  "Clear to Close",
  "Funded",
];
