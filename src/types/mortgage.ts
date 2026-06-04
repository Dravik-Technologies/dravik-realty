export type LoanType   = "Conventional" | "FHA" | "VA" | "Jumbo" | "USDA";
export type LoanStage  = "pre-qual" | "application" | "underwriting" | "approved" | "closing" | "declined";
export type LoanView   = "my-loans" | "team-loans" | "all";
export type DocStatus  = "received" | "pending" | "missing" | "approved";
export type CondStatus = "open" | "satisfied" | "waived";
export type DetailTab  =
  | "overview"
  | "documents"
  | "underwriting"
  | "conditions"
  | "communications"
  | "real-estate";

export interface MortgageDoc {
  id:            string;
  name:          string;
  status:        DocStatus;
  receivedDate?: string;   // display string, e.g. "May 15"
}

export interface MortgageCond {
  id:          string;
  description: string;
  status:      CondStatus;
  dueDate:     string;     // display string, e.g. "Jun 10"
}

export interface MortgageApplication {
  id:              string;
  clientName:      string;
  clientInitials:  string;
  clientColor:     string;
  clientPhone:     string;
  clientEmail:     string;
  propertyAddress: string;
  city:            string;
  loanType:        LoanType;
  loanAmount:      number;
  purchasePrice:   number;
  downPayment:     number;
  stage:           LoanStage;
  progress:        number;       // 0–100 within current stage
  daysInStage:     number;
  creditScore:     number;
  dti:             number;       // debt-to-income ratio %
  ltv:             number;       // loan-to-value ratio %
  interestRate:    number;       // e.g. 6.875
  termYears:       15 | 20 | 30;
  monthlyPayment:  number;       // principal + interest
  piti:            number;       // full monthly housing payment
  assignedOfficer: string;
  submittedDate:   string;       // display string
  closingDate:     string;       // display string
  documents:       MortgageDoc[];
  conditions:      MortgageCond[];
  linkedLeadId?:   string;
  linkedTransId?:  string;
  notes:           string;
}
