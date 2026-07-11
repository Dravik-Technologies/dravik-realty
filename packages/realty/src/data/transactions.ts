import { localDemoData } from "@dravik/shared";
import type {
  Transaction, TransactionDocument, TransactionTask,
  TransactionParty, ActivityEntry, MortgageInfo, CommissionInfo,
} from "@dravik/contracts/realty";

// ─── Helpers ──────────────────────────────────────────────────
function doc(
  id: string, name: string, type: TransactionDocument["type"],
  uploadedAt: string, signed: boolean, req: number, done: number
): TransactionDocument {
  return { id, name, type, uploadedAt, signed, signaturesRequired: req, signaturesComplete: done };
}

function task(
  id: string, label: string, due: string, done: boolean,
  category: TransactionTask["category"]
): TransactionTask {
  return { id, label, due, done, category };
}

function party(name: string, role: string, email: string, phone: string): TransactionParty {
  return { name, role, email, phone };
}

function entry(id: string, date: string, actor: string, action: string, note?: string): ActivityEntry {
  return { id, date, actor, action, note };
}

function commission(
  rate: number, hasReferral: boolean, refAgent: string | undefined,
  refRate: number, dravikSplit: number, txFee: number
): CommissionInfo {
  return {
    commissionRate: rate,
    hasReferral,
    referralAgent: refAgent,
    referralRate: refRate,
    dravikSplitRate: dravikSplit,
    transactionFee: txFee,
  };
}

function mortgage(
  lender: string, type: MortgageInfo["loanType"], amount: number,
  rate: number, down: number, status: MortgageInfo["status"]
): MortgageInfo {
  return { lender, loanType: type, loanAmount: amount, rate, term: 30, downPayment: down, status };
}

// ─── Sample transactions (today = 2026-05-25) ─────────────────
const LOCAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  // ── 1: Under Contract ───────────────────────────────────────
  {
    id: "tx1",
    address: "12 Ocean Dr", city: "Miami Beach", state: "FL", zip: "33139",
    heroImage: "https://picsum.photos/seed/tx1/800/400",
    contractPrice: 875_000, listPrice: 899_000,
    stage: "Under Contract", status: "Active", type: "Buy",
    contractDate: "2026-05-20", closingDate: "2026-06-20", daysUntilClose: 26, progress: 22,
    client: { name: "Daniel & Rosa Morales", email: "d.morales@email.com", phone: "(305) 555-0171", role: "Buyer" },
    agent: "Chris Macabugao", mlsNumber: "MLS-221845",
    commission: commission(3.0, false, undefined, 0, 20, 395),
    mortgage: mortgage("Regions Bank", "Conventional", 700_000, 6.75, 175_000, "Conditionally Approved"),
    parties: [
      party("Daniel & Rosa Morales", "Buyer",         "d.morales@email.com",     "(305) 555-0171"),
      party("Chris Macabugao",       "Buyer's Agent", "chris@dravikrealty.com",    "(305) 555-0100"),
      party("Patricia Kim",          "Seller's Agent","p.kim@miamiprops.com",    "(305) 555-0288"),
      party("John Ericson",          "Title Officer", "j.ericson@cleartitle.com","(786) 555-0303"),
      party("Regions Bank",          "Lender",        "loans@regions.com",       "(800) 555-0900"),
    ],
    tasks: [
      task("tx1-t1", "Executed purchase agreement received",      "2026-05-21", true,  "general"),
      task("tx1-t2", "Earnest money deposit verified",            "2026-05-23", true,  "finance"),
      task("tx1-t3", "Schedule home inspection",                  "2026-05-28", false, "inspection"),
      task("tx1-t4", "Submit loan application",                   "2026-05-30", false, "finance"),
      task("tx1-t5", "Order title search",                        "2026-06-01", false, "title"),
    ],
    documents: [
      doc("tx1-d1", "Purchase Agreement",        "contract",   "2026-05-20", true,  2, 2),
      doc("tx1-d2", "Proof of Funds",             "disclosure", "2026-05-22", false, 0, 0),
    ],
    activity: [
      entry("tx1-a1", "2026-05-20", "Chris Macabugao",  "Transaction opened — offer accepted at $875,000"),
      entry("tx1-a2", "2026-05-21", "Chris Macabugao",  "Purchase agreement executed by all parties"),
      entry("tx1-a3", "2026-05-23", "Patricia Kim",     "Earnest money deposit confirmed", "$8,750 deposited to escrow"),
    ],
  },

  // ── 2: Under Contract ───────────────────────────────────────
  {
    id: "tx2",
    address: "1200 Key Biscayne Blvd", city: "Key Biscayne", state: "FL", zip: "33149",
    heroImage: "https://picsum.photos/seed/tx2/800/400",
    contractPrice: 4_800_000, listPrice: 5_100_000,
    stage: "Under Contract", status: "Active", type: "Sell",
    contractDate: "2026-05-18", closingDate: "2026-07-10", daysUntilClose: 46, progress: 18,
    client: { name: "Marcus & Elena Stern", email: "m.stern@sterngroup.com", phone: "(305) 555-0244", role: "Seller" },
    agent: "Chris Macabugao", coAgent: "Alejandra Vega", mlsNumber: "MLS-228401",
    commission: commission(2.5, true, "Roberto Blanco", 25, 20, 395),
    mortgage: undefined,
    parties: [
      party("Marcus & Elena Stern",  "Seller",        "m.stern@sterngroup.com", "(305) 555-0244"),
      party("Chris Macabugao",       "Listing Agent", "chris@dravikrealty.com",   "(305) 555-0100"),
      party("Alejandra Vega",        "Co-Agent",      "a.vega@dravikrealty.com",  "(305) 555-0102"),
      party("Roberto Blanco",        "Buyer's Agent", "r.blanco@blancorp.com",  "(305) 555-0388"),
      party("Fidelity National",     "Title Officer", "miami@fnf.com",          "(800) 555-1111"),
    ],
    tasks: [
      task("tx2-t1", "Listing agreement signed",           "2026-05-18", true,  "general"),
      task("tx2-t2", "Property disclosures delivered",     "2026-05-19", true,  "general"),
      task("tx2-t3", "HOA docs requested",                 "2026-05-26", false, "general"),
      task("tx2-t4", "Coordinate access for inspection",   "2026-06-01", false, "inspection"),
    ],
    documents: [
      doc("tx2-d1", "Listing Agreement",    "contract",    "2026-05-18", true,  1, 1),
      doc("tx2-d2", "Seller's Disclosure",  "disclosure",  "2026-05-19", true,  1, 1),
      doc("tx2-d3", "Purchase Contract",    "contract",    "2026-05-18", true,  2, 2),
    ],
    activity: [
      entry("tx2-a1", "2026-05-18", "Chris Macabugao", "Offer accepted at $4,800,000 — $300K below ask"),
      entry("tx2-a2", "2026-05-19", "Alejandra Vega",  "Seller disclosure package delivered to buyer"),
      entry("tx2-a3", "2026-05-21", "Roberto Blanco",  "Buyer earnest money received", "$48,000 deposited"),
    ],
  },

  // ── 3: Inspections ──────────────────────────────────────────
  {
    id: "tx3",
    address: "580 Sunset Isle Dr", city: "Miami Beach", state: "FL", zip: "33140",
    heroImage: "https://picsum.photos/seed/tx3/800/400",
    contractPrice: 1_350_000, listPrice: 1_380_000,
    stage: "Inspections", status: "Active", type: "Sell",
    contractDate: "2026-05-10", closingDate: "2026-06-25", daysUntilClose: 31, progress: 38,
    client: { name: "Claudia Esperanza", email: "c.esperanza@gmail.com", phone: "(786) 555-0355", role: "Seller" },
    agent: "Chris Macabugao", mlsNumber: "MLS-219340",
    commission: commission(3.0, false, undefined, 0, 20, 395),
    mortgage: undefined,
    parties: [
      party("Claudia Esperanza",  "Seller",        "c.esperanza@gmail.com", "(786) 555-0355"),
      party("Chris Macabugao",    "Listing Agent", "chris@dravikrealty.com",  "(305) 555-0100"),
      party("Tom Nguyen",         "Buyer's Agent", "t.nguyen@luxere.com",   "(786) 555-0471"),
      party("Doral Title Group",  "Title Officer", "closings@doral.com",    "(305) 555-0600"),
    ],
    tasks: [
      task("tx3-t1", "Inspection scheduled",            "2026-05-22", true,  "inspection"),
      task("tx3-t2", "Inspection report delivered",     "2026-05-25", false, "inspection"),
      task("tx3-t3", "Seller review inspection items",  "2026-05-27", false, "inspection"),
      task("tx3-t4", "Buyer repair request deadline",   "2026-05-30", false, "inspection"),
      task("tx3-t5", "Submit title order",              "2026-06-01", false, "title"),
    ],
    documents: [
      doc("tx3-d1", "Purchase Agreement",   "contract",    "2026-05-10", true,  2, 2),
      doc("tx3-d2", "Inspection Report",    "inspection",  "2026-05-25", false, 0, 0),
    ],
    activity: [
      entry("tx3-a1", "2026-05-10", "Chris Macabugao", "Transaction opened at $1,350,000"),
      entry("tx3-a2", "2026-05-22", "Tom Nguyen",      "Inspector access confirmed for May 25th"),
      entry("tx3-a3", "2026-05-24", "Chris Macabugao", "General inspection completed", "Roof and HVAC flagged for review"),
    ],
  },

  // ── 4: Inspections ──────────────────────────────────────────
  {
    id: "tx4",
    address: "320 N.W. 25th St", city: "Wynwood", state: "FL", zip: "33127",
    heroImage: "https://picsum.photos/seed/tx4/800/400",
    contractPrice: 495_000, listPrice: 510_000,
    stage: "Inspections", status: "Active", type: "Sell",
    contractDate: "2026-05-12", closingDate: "2026-06-30", daysUntilClose: 36, progress: 42,
    client: { name: "Sofia Delgado", email: "s.delgado@wgdesign.com", phone: "(305) 555-0519", role: "Seller" },
    agent: "Chris Macabugao", mlsNumber: "MLS-220187",
    commission: commission(3.0, false, undefined, 0, 20, 395),
    mortgage: mortgage("Wells Fargo", "Conventional", 396_000, 7.0, 99_000, "Pre-Approved"),
    parties: [
      party("Sofia Delgado",      "Seller",        "s.delgado@wgdesign.com", "(305) 555-0519"),
      party("Chris Macabugao",    "Listing Agent", "chris@dravikrealty.com",   "(305) 555-0100"),
      party("Lena Fox",           "Buyer's Agent", "l.fox@homequest.com",    "(786) 555-0622"),
      party("Wells Fargo",        "Lender",        "closings@wf.com",        "(800) 555-3800"),
      party("Heritage Title",     "Title Officer", "ops@heritagetitle.com",  "(305) 555-0705"),
    ],
    tasks: [
      task("tx4-t1", "Inspection completed",               "2026-05-20", true,  "inspection"),
      task("tx4-t2", "Seller repair addendum signed",      "2026-05-27", false, "inspection"),
      task("tx4-t3", "Buyer approval of repairs",          "2026-05-29", false, "inspection"),
      task("tx4-t4", "Loan application submitted",         "2026-05-25", true,  "finance"),
    ],
    documents: [
      doc("tx4-d1", "Purchase Contract",  "contract",   "2026-05-12", true,  2, 2),
      doc("tx4-d2", "Inspection Report",  "inspection", "2026-05-20", true,  0, 0),
    ],
    activity: [
      entry("tx4-a1", "2026-05-12", "Chris Macabugao", "Offer accepted at $495,000"),
      entry("tx4-a2", "2026-05-20", "Lena Fox",        "Inspection completed — minor items noted"),
      entry("tx4-a3", "2026-05-24", "Chris Macabugao", "Negotiating repair credit of $2,500"),
    ],
  },

  // ── 5: Financing Approved ────────────────────────────────────
  {
    id: "tx5",
    address: "1890 Coral Way", city: "Coral Gables", state: "FL", zip: "33145",
    heroImage: "https://picsum.photos/seed/tx5/800/400",
    contractPrice: 545_000, listPrice: 565_000,
    stage: "Financing Approved", status: "Active", type: "Buy",
    contractDate: "2026-05-01", closingDate: "2026-06-08", daysUntilClose: 14, progress: 58,
    client: { name: "Kevin Okonkwo", email: "k.okonkwo@techpros.io", phone: "(786) 555-0638", role: "Buyer" },
    agent: "Chris Macabugao", mlsNumber: "MLS-217440",
    commission: commission(3.0, false, undefined, 0, 20, 395),
    mortgage: mortgage("Bank of America", "FHA", 534_000, 6.5, 11_000, "Clear to Close"),
    parties: [
      party("Kevin Okonkwo",       "Buyer",         "k.okonkwo@techpros.io",  "(786) 555-0638"),
      party("Chris Macabugao",     "Buyer's Agent", "chris@dravikrealty.com",   "(305) 555-0100"),
      party("Maricel Santos",      "Seller's Agent","m.santos@proprealty.com","(305) 555-0744"),
      party("Bank of America",     "Lender",        "closings@bofa.com",      "(800) 555-2000"),
      party("Miami Title Partners","Title Officer", "ops@mtpartners.com",     "(305) 555-0810"),
    ],
    tasks: [
      task("tx5-t1", "Loan commitment received",    "2026-05-18", true,  "finance"),
      task("tx5-t2", "Clear to close issued",       "2026-05-22", true,  "finance"),
      task("tx5-t3", "Final walk-through scheduled","2026-06-06", false, "closing"),
      task("tx5-t4", "Closing disclosure reviewed", "2026-06-04", false, "closing"),
      task("tx5-t5", "Wire transfer confirmed",     "2026-06-07", false, "closing"),
    ],
    documents: [
      doc("tx5-d1", "Purchase Agreement",    "contract",   "2026-05-01", true,  2, 2),
      doc("tx5-d2", "Loan Commitment Letter","loan",       "2026-05-18", true,  1, 1),
      doc("tx5-d3", "Title Commitment",      "title",      "2026-05-20", true,  0, 0),
    ],
    activity: [
      entry("tx5-a1", "2026-05-01", "Chris Macabugao", "Transaction opened — FHA loan submitted"),
      entry("tx5-a2", "2026-05-18", "Bank of America",  "Loan commitment issued"),
      entry("tx5-a3", "2026-05-22", "Bank of America",  "Clear to close received!", "Closing set for June 8th"),
    ],
  },

  // ── 6: Financing Approved ────────────────────────────────────
  {
    id: "tx6",
    address: "234 Alhambra Circle", city: "Coral Gables", state: "FL", zip: "33134",
    heroImage: "https://picsum.photos/seed/tx6/800/400",
    contractPrice: 980_000, listPrice: 995_000,
    stage: "Financing Approved", status: "Active", type: "Buy",
    contractDate: "2026-05-05", closingDate: "2026-06-18", daysUntilClose: 24, progress: 62,
    client: { name: "Helen & Roy Park", email: "h.park@parkco.com", phone: "(305) 555-0867", role: "Buyer" },
    agent: "Chris Macabugao", mlsNumber: "MLS-218923",
    commission: commission(3.0, true, "Natalie Cruz", 30, 20, 395),
    mortgage: mortgage("Chase", "Jumbo", 784_000, 6.875, 196_000, "Conditionally Approved"),
    parties: [
      party("Helen & Roy Park",   "Buyer",         "h.park@parkco.com",     "(305) 555-0867"),
      party("Chris Macabugao",    "Buyer's Agent", "chris@dravikrealty.com",  "(305) 555-0100"),
      party("Natalie Cruz",       "Referring Agent","n.cruz@referrals.com", "(786) 555-0944"),
      party("Diane Wheeler",      "Seller's Agent","d.wheeler@cgrealty.com","(305) 555-0955"),
      party("Chase Mortgage",     "Lender",        "closings@chase.com",    "(800) 555-4600"),
      party("Sunset Title",       "Title Officer", "ops@sunttl.com",        "(305) 555-1010"),
    ],
    tasks: [
      task("tx6-t1", "Inspection completed",             "2026-05-15", true,  "inspection"),
      task("tx6-t2", "Appraisal ordered",                "2026-05-20", true,  "finance"),
      task("tx6-t3", "Appraisal received",               "2026-05-30", false, "finance"),
      task("tx6-t4", "Underwriter conditions cleared",   "2026-06-05", false, "finance"),
      task("tx6-t5", "Title clear",                      "2026-06-10", false, "title"),
    ],
    documents: [
      doc("tx6-d1", "Purchase Agreement",   "contract",   "2026-05-05", true,  2, 2),
      doc("tx6-d2", "Inspection Report",    "inspection", "2026-05-15", true,  0, 0),
      doc("tx6-d3", "Appraisal Order",      "appraisal",  "2026-05-20", false, 0, 0),
    ],
    activity: [
      entry("tx6-a1", "2026-05-05", "Natalie Cruz",     "Referred buyer received — $980K offer accepted"),
      entry("tx6-a2", "2026-05-15", "Chris Macabugao",  "Inspection clear — no major items"),
      entry("tx6-a3", "2026-05-20", "Chase Mortgage",   "Appraisal ordered by lender"),
      entry("tx6-a4", "2026-05-23", "Chris Macabugao",  "Jumbo underwriting in progress — CTC expected by June 5"),
    ],
  },

  // ── 7: Appraisal / Title ─────────────────────────────────────
  {
    id: "tx7",
    address: "28 Brickell Key Dr", city: "Brickell", state: "FL", zip: "33131",
    heroImage: "https://picsum.photos/seed/tx7/800/400",
    contractPrice: 2_200_000, listPrice: 2_250_000,
    stage: "Appraisal / Title", status: "Active", type: "Dual",
    contractDate: "2026-04-28", closingDate: "2026-06-03", daysUntilClose: 9, progress: 78,
    client: { name: "Alexander Reyes", email: "a.reyes@reyescap.com", phone: "(786) 555-1055", role: "Dual" },
    agent: "Chris Macabugao", coAgent: "Alejandra Vega", mlsNumber: "MLS-215810",
    commission: commission(2.5, false, undefined, 0, 20, 395),
    mortgage: mortgage("Citi Private Bank", "Jumbo", 1_760_000, 6.5, 440_000, "Clear to Close"),
    parties: [
      party("Alexander Reyes",    "Buyer & Seller",  "a.reyes@reyescap.com",  "(786) 555-1055"),
      party("Chris Macabugao",    "Dual Agent",      "chris@dravikrealty.com",  "(305) 555-0100"),
      party("Alejandra Vega",     "Transaction Mgr", "a.vega@dravikrealty.com", "(305) 555-0102"),
      party("Citi Private Bank",  "Lender",          "closings@citi.com",     "(800) 555-7000"),
      party("Premier Title Co.",  "Title Officer",   "closing@premiertl.com", "(305) 555-1120"),
    ],
    tasks: [
      task("tx7-t1", "Appraisal ordered",              "2026-05-05", true,  "finance"),
      task("tx7-t2", "Appraisal received — at value",  "2026-05-18", true,  "finance"),
      task("tx7-t3", "Title search completed",         "2026-05-20", true,  "title"),
      task("tx7-t4", "Title exceptions cleared",       "2026-05-28", false, "title"),
      task("tx7-t5", "Closing disclosure sent",        "2026-05-30", false, "closing"),
      task("tx7-t6", "Final walk-through",             "2026-06-02", false, "closing"),
    ],
    documents: [
      doc("tx7-d1", "Purchase Agreement",   "contract",   "2026-04-28", true,  2, 2),
      doc("tx7-d2", "Appraisal Report",     "appraisal",  "2026-05-18", true,  0, 0),
      doc("tx7-d3", "Title Commitment",     "title",      "2026-05-20", true,  1, 0),
      doc("tx7-d4", "Closing Disclosure",   "loan",       "2026-05-28", false, 2, 0),
    ],
    activity: [
      entry("tx7-a1", "2026-04-28", "Chris Macabugao", "Dual agency disclosed and agreed — deal at $2.2M"),
      entry("tx7-a2", "2026-05-18", "Citi Private Bank","Appraisal confirmed at full value $2.2M"),
      entry("tx7-a3", "2026-05-20", "Premier Title",   "Title search back — one exception pending cure"),
      entry("tx7-a4", "2026-05-24", "Alejandra Vega",  "Title exception expected to clear by May 28"),
    ],
  },

  // ── 8: Appraisal / Title ─────────────────────────────────────
  {
    id: "tx8",
    address: "1001 Brickell Bay Dr", city: "Brickell", state: "FL", zip: "33131",
    heroImage: "https://picsum.photos/seed/tx8/800/400",
    contractPrice: 1_900_000, listPrice: 1_975_000,
    stage: "Appraisal / Title", status: "Active", type: "Buy",
    contractDate: "2026-04-22", closingDate: "2026-06-05", daysUntilClose: 11, progress: 82,
    client: { name: "Dr. Priya Nair", email: "p.nair@nairmd.com", phone: "(305) 555-1199", role: "Buyer" },
    agent: "Chris Macabugao", mlsNumber: "MLS-214402",
    commission: commission(2.75, true, "Thomas Wu", 25, 20, 395),
    mortgage: undefined,
    parties: [
      party("Dr. Priya Nair",    "Buyer",         "p.nair@nairmd.com",      "(305) 555-1199"),
      party("Chris Macabugao",   "Buyer's Agent", "chris@dravikrealty.com",   "(305) 555-0100"),
      party("Thomas Wu",         "Referring Agent","t.wu@eliterefer.com",   "(786) 555-1244"),
      party("Carlos Mendez",     "Seller's Agent","c.mendez@suncoastrealty.com","(305) 555-1300"),
      party("Bayfront Title",    "Title Officer", "ops@bayfronttitle.com",  "(305) 555-1350"),
    ],
    tasks: [
      task("tx8-t1", "Cash proof of funds verified",  "2026-04-25", true,  "finance"),
      task("tx8-t2", "Appraisal waiver signed",        "2026-04-28", true,  "finance"),
      task("tx8-t3", "Title search ordered",           "2026-05-02", true,  "title"),
      task("tx8-t4", "Title commitment received",      "2026-05-22", true,  "title"),
      task("tx8-t5", "HUD-1 / Settlement stmt reviewed","2026-05-30", false, "closing"),
      task("tx8-t6", "Wire instructions confirmed",    "2026-06-04", false, "closing"),
    ],
    documents: [
      doc("tx8-d1", "Purchase Agreement",     "contract",    "2026-04-22", true,  2, 2),
      doc("tx8-d2", "Proof of Funds Letter",  "disclosure",  "2026-04-25", true,  0, 0),
      doc("tx8-d3", "Title Commitment",       "title",       "2026-05-22", true,  1, 1),
      doc("tx8-d4", "Settlement Statement",   "loan",        "2026-05-29", false, 2, 0),
    ],
    activity: [
      entry("tx8-a1", "2026-04-22", "Thomas Wu",       "Referral: Dr. Nair offer accepted at $1.9M — cash deal"),
      entry("tx8-a2", "2026-04-25", "Chris Macabugao", "Proof of funds verified — $2.1M in escrow account"),
      entry("tx8-a3", "2026-05-22", "Bayfront Title",  "Title commitment issued — clean title"),
      entry("tx8-a4", "2026-05-24", "Chris Macabugao", "Closing scheduled for June 5 — settlement stmt pending"),
    ],
  },

  // ── 9: Closing / Funded ──────────────────────────────────────
  {
    id: "tx9",
    address: "47 Bayshore Dr", city: "Coconut Grove", state: "FL", zip: "33133",
    heroImage: "https://picsum.photos/seed/tx9/800/400",
    contractPrice: 725_000, listPrice: 739_000,
    stage: "Closing / Funded", status: "Active", type: "Buy",
    contractDate: "2026-04-15", closingDate: "2026-05-28", daysUntilClose: 3, progress: 93,
    client: { name: "James & Yolanda Turner", email: "j.turner@tgroup.net", phone: "(786) 555-1388", role: "Buyer" },
    agent: "Chris Macabugao", mlsNumber: "MLS-212700",
    commission: commission(3.0, false, undefined, 0, 20, 395),
    mortgage: mortgage("SunTrust", "Conventional", 580_000, 6.875, 145_000, "Clear to Close"),
    parties: [
      party("James & Yolanda Turner","Buyer",        "j.turner@tgroup.net",   "(786) 555-1388"),
      party("Chris Macabugao",      "Buyer's Agent", "chris@dravikrealty.com",  "(305) 555-0100"),
      party("Grace Hoffman",        "Seller's Agent","g.hoffman@miamiagent.com","(305) 555-1455"),
      party("SunTrust Mortgage",    "Lender",        "closings@suntrust.com", "(800) 555-8000"),
      party("Grove Title LLC",      "Title Officer", "ops@grovetitle.com",    "(305) 555-1500"),
    ],
    tasks: [
      task("tx9-t1", "Clear to close received",    "2026-05-15", true,  "finance"),
      task("tx9-t2", "Closing disclosure signed",  "2026-05-22", true,  "closing"),
      task("tx9-t3", "Final walk-through",         "2026-05-27", false, "closing"),
      task("tx9-t4", "Wire transfer confirmed",    "2026-05-27", false, "closing"),
      task("tx9-t5", "Keys handed over",           "2026-05-28", false, "closing"),
    ],
    documents: [
      doc("tx9-d1", "Purchase Agreement",     "contract",  "2026-04-15", true,  2, 2),
      doc("tx9-d2", "Loan Commitment",        "loan",      "2026-05-05", true,  1, 1),
      doc("tx9-d3", "Appraisal Report",       "appraisal", "2026-05-10", true,  0, 0),
      doc("tx9-d4", "Closing Disclosure",     "loan",      "2026-05-22", true,  2, 2),
      doc("tx9-d5", "Title Insurance Policy", "title",     "2026-05-24", true,  0, 0),
    ],
    activity: [
      entry("tx9-a1", "2026-04-15", "Chris Macabugao", "Offer accepted at $725,000"),
      entry("tx9-a2", "2026-05-05", "SunTrust",        "Loan commitment issued"),
      entry("tx9-a3", "2026-05-15", "SunTrust",        "Clear to close issued 🎉"),
      entry("tx9-a4", "2026-05-22", "Chris Macabugao", "CD signed — closing confirmed May 28", "Buyer wire due by noon"),
    ],
  },

  // ── 10: Closing / Funded ─────────────────────────────────────
  {
    id: "tx10",
    address: "500 Alton Rd", city: "South Beach", state: "FL", zip: "33139",
    heroImage: "https://picsum.photos/seed/tx10/800/400",
    contractPrice: 6_500_000, listPrice: 6_750_000,
    stage: "Closing / Funded", status: "Active", type: "Dual",
    contractDate: "2026-04-10", closingDate: "2026-05-30", daysUntilClose: 5, progress: 97,
    client: { name: "Viktor & Lena Sokolov", email: "v.sokolov@vsgroup.com", phone: "(305) 555-1600", role: "Dual" },
    agent: "Chris Macabugao", coAgent: "Alejandra Vega", mlsNumber: "MLS-210055",
    commission: commission(2.5, true, "Roberto Blanco", 20, 20, 395),
    mortgage: undefined,
    parties: [
      party("Viktor & Lena Sokolov","Buyer & Seller",  "v.sokolov@vsgroup.com","(305) 555-1600"),
      party("Chris Macabugao",     "Dual Agent",      "chris@dravikrealty.com", "(305) 555-0100"),
      party("Alejandra Vega",      "Transaction Mgr", "a.vega@dravikrealty.com","(305) 555-0102"),
      party("Roberto Blanco",      "Referring Agent", "r.blanco@blancorp.com","(305) 555-0388"),
      party("SB Title & Escrow",   "Title Officer",   "ops@sbtitle.com",      "(305) 555-1700"),
    ],
    tasks: [
      task("tx10-t1", "All contingencies removed",       "2026-05-10", true,  "general"),
      task("tx10-t2", "Settlement statement approved",   "2026-05-20", true,  "closing"),
      task("tx10-t3", "Closing disclosure signed",       "2026-05-22", true,  "closing"),
      task("tx10-t4", "Buyer wire transfer — $6.5M",     "2026-05-29", false, "closing"),
      task("tx10-t5", "Keys and possession transfer",    "2026-05-30", false, "closing"),
    ],
    documents: [
      doc("tx10-d1", "Purchase Agreement",       "contract",    "2026-04-10", true, 2, 2),
      doc("tx10-d2", "Cash Verification Letter", "disclosure",  "2026-04-12", true, 0, 0),
      doc("tx10-d3", "Title Commitment",         "title",       "2026-04-25", true, 1, 1),
      doc("tx10-d4", "Closing Disclosure",       "loan",        "2026-05-22", true, 2, 2),
      doc("tx10-d5", "Deed & Transfer Docs",     "title",       "2026-05-24", false, 3, 0),
    ],
    activity: [
      entry("tx10-a1", "2026-04-10", "Roberto Blanco",  "Referral closed — $6.5M dual agency transaction"),
      entry("tx10-a2", "2026-05-10", "Chris Macabugao", "All contingencies removed — deal locked"),
      entry("tx10-a3", "2026-05-22", "Chris Macabugao", "CD executed — closing confirmed May 30"),
      entry("tx10-a4", "2026-05-24", "Alejandra Vega",  "Deed documents prepared and delivered to title"),
      entry("tx10-a5", "2026-05-24", "SB Title & Escrow","Closing package ready — wire instructions sent"),
    ],
  },
];

export const SAMPLE_TRANSACTIONS: Transaction[] = localDemoData(LOCAL_SAMPLE_TRANSACTIONS);
