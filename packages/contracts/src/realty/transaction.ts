export type PipelineStage =
  | "Under Contract"
  | "Inspections"
  | "Financing Approved"
  | "Appraisal / Title"
  | "Closing / Funded";

export type TransactionType = "Buy" | "Sell" | "Dual";
export type TransactionStatus = "Active" | "Closed" | "Cancelled";
export type TransactionTab =
  | "overview" | "documents" | "commission" | "tasks" | "mortgage" | "communications";
export type DocType = "contract" | "inspection" | "appraisal" | "disclosure" | "title" | "loan";
export type TaskCategory = "inspection" | "finance" | "title" | "closing" | "general";

export const PIPELINE_STAGES: PipelineStage[] = [
  "Under Contract",
  "Inspections",
  "Financing Approved",
  "Appraisal / Title",
  "Closing / Funded",
];

// Progress % per stage (midpoint of stage range)
export const STAGE_PROGRESS: Record<PipelineStage, number> = {
  "Under Contract":    20,
  "Inspections":       40,
  "Financing Approved": 60,
  "Appraisal / Title": 80,
  "Closing / Funded":  95,
};

export interface TransactionParty {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface TransactionDocument {
  id: string;
  name: string;
  type: DocType;
  uploadedAt: string;
  signed: boolean;
  signaturesRequired: number;
  signaturesComplete: number;
}

export interface TransactionTask {
  id: string;
  label: string;
  due: string;
  done: boolean;
  category: TaskCategory;
}

export interface MortgageInfo {
  lender: string;
  loanType: "Conventional" | "FHA" | "VA" | "Cash" | "Jumbo";
  loanAmount: number;
  rate: number;
  term: number;
  downPayment: number;
  status: "Pre-Approved" | "Submitted" | "Conditionally Approved" | "Clear to Close" | "Cash";
}

export interface CommissionInfo {
  commissionRate: number;
  hasReferral: boolean;
  referralAgent?: string;
  referralRate: number;
  dravikSplitRate: number;
  transactionFee: number;
}

export interface ActivityEntry {
  id: string;
  date: string;
  actor: string;
  action: string;
  note?: string;
}

export interface Transaction {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  heroImage: string;
  contractPrice: number;
  listPrice: number;
  stage: PipelineStage;
  status: TransactionStatus;
  type: TransactionType;
  contractDate: string;
  closingDate: string;
  daysUntilClose: number;
  progress: number;
  client: {
    name: string;
    email: string;
    phone: string;
    role: "Buyer" | "Seller" | "Dual";
  };
  agent: string;
  coAgent?: string;
  mlsNumber?: string;
  commission: CommissionInfo;
  mortgage?: MortgageInfo;
  parties: TransactionParty[];
  tasks: TransactionTask[];
  documents: TransactionDocument[];
  activity: ActivityEntry[];
}
