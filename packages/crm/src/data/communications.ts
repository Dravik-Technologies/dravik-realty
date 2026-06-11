import type { Conversation, Message } from "@dravik/contracts/crm";

// ─── Helpers ──────────────────────────────────────────────────
function msg(
  id: string,
  role: Message["role"],
  channel: Message["channel"],
  senderName: string,
  content: string,
  timestamp: string,
  displayTime: string,
  read = true,
): Message {
  return { id, role, channel, senderName, content, timestamp, displayTime, read };
}

const ME = "Chris Macabugao";

// ─── Conversations ────────────────────────────────────────────
export const CONVERSATIONS: Conversation[] = [
  // ── 1. John Smith — high-intent buyer ──────────────────────
  {
    id: "c1",
    clientName: "John Smith", clientInitials: "JS", clientColor: "#3B82F6",
    clientPhone: "(305) 555-0201", clientEmail: "john.smith@email.com",
    tag: "lead", channel: "sms", isHighIntent: true,
    propertyAddress: "1850 Brickell Ave #PH3",
    lastMessage: "Yes, Saturday 2 PM works perfectly. See you there!",
    lastTimestamp: "2026-05-29T10:32:00", displayTime: "10:32 AM",
    unreadCount: 2,
    messages: [
      msg("m1-1", "client", "sms", "John Smith",   "Hi, I saw the Brickell penthouse listing and I'm very interested. Is it still available?",                          "2026-05-29T08:15:00", "8:15 AM"),
      msg("m1-2", "agent",  "sms", ME,             "Hi John! Great news — it's still on the market. It's a stunning PH with wraparound views. Want to schedule a showing?", "2026-05-29T08:42:00", "8:42 AM"),
      msg("m1-3", "client", "sms", "John Smith",   "Absolutely. I'm pre-approved for $5M+. This could be the one. What's the seller's timeline?",                         "2026-05-29T09:05:00", "9:05 AM"),
      msg("m1-4", "agent",  "sms", ME,             "Perfect — seller is motivated, looking to close within 45 days. I can do Saturday or Sunday for the showing.",         "2026-05-29T09:20:00", "9:20 AM"),
      msg("m1-5", "client", "sms", "John Smith",   "Yes, Saturday 2 PM works perfectly. See you there!",                                                                    "2026-05-29T10:32:00", "10:32 AM", false),
    ],
  },

  // ── 2. Maria Rodriguez — active transaction ────────────────
  {
    id: "c2",
    clientName: "Maria Rodriguez", clientInitials: "MR", clientColor: "#10B981",
    clientPhone: "(305) 555-0202", clientEmail: "maria.r@email.com",
    tag: "transaction", channel: "email",
    subject: "Re: 4110 Salzedo — Closing Update",
    propertyAddress: "4110 Salzedo St, Coral Gables",
    lastMessage: "Got it. I'll have my attorney review the addendum today.",
    lastTimestamp: "2026-05-29T09:15:00", displayTime: "9:15 AM",
    unreadCount: 1,
    messages: [
      msg("m2-1", "agent",  "email", ME,               "Hi Maria, just confirming the closing is set for June 12. Title has cleared and the lender confirmed final approval.",    "2026-05-28T14:00:00", "Yesterday, 2:00 PM"),
      msg("m2-2", "client", "email", "Maria Rodriguez", "That's wonderful news! Do I need to bring anything specific to closing?",                                                  "2026-05-28T15:30:00", "Yesterday, 3:30 PM"),
      msg("m2-3", "agent",  "email", ME,               "Bring your photo ID, certified funds for the closing costs, and the homeowner's insurance binder. I'll send a full checklist.", "2026-05-28T16:00:00", "Yesterday, 4:00 PM"),
      msg("m2-4", "system", "system", "AxenOne",        "Document added: Closing Disclosure — Maria Rodriguez — 4110 Salzedo",                                                     "2026-05-29T08:00:00", "8:00 AM"),
      msg("m2-5", "agent",  "email", ME,               "Maria, I've attached the closing disclosure for your review. There's a small addendum item we need to address.",           "2026-05-29T08:45:00", "8:45 AM"),
      msg("m2-6", "client", "email", "Maria Rodriguez", "Got it. I'll have my attorney review the addendum today.",                                                                  "2026-05-29T09:15:00", "9:15 AM", false),
    ],
  },

  // ── 3. Patricia Nguyen — high-intent buyer ─────────────────
  {
    id: "c3",
    clientName: "Patricia Nguyen", clientInitials: "PN", clientColor: "#EC4899",
    clientPhone: "(305) 555-0203",
    tag: "lead", channel: "sms", isHighIntent: true,
    lastMessage: "Can we see all three this Saturday? I'm ready to make an offer.",
    lastTimestamp: "2026-05-29T08:50:00", displayTime: "8:50 AM",
    unreadCount: 3,
    messages: [
      msg("m3-1", "client", "sms", "Patricia Nguyen", "Hi! I found you through Zillow. Looking for a 4BR in Coral Gables under $2.8M.",                                 "2026-05-28T10:00:00", "Yesterday, 10:00 AM"),
      msg("m3-2", "agent",  "sms", ME,               "Hi Patricia! Great timing — I have 3 listings that fit perfectly. Let me send you the details.",                   "2026-05-28T10:15:00", "Yesterday, 10:15 AM"),
      msg("m3-3", "agent",  "sms", ME,               "Sent 3 listings to your email — 4530 Madrid St, 6120 Riviera Dr, and 315 Hardee Rd. All stunning!",                "2026-05-28T10:20:00", "Yesterday, 10:20 AM"),
      msg("m3-4", "client", "sms", "Patricia Nguyen", "Just reviewed them — all three look amazing. I love the Madrid St one!",                                          "2026-05-28T18:45:00", "Yesterday, 6:45 PM"),
      msg("m3-5", "client", "sms", "Patricia Nguyen", "Can we see all three this Saturday? I'm ready to make an offer.",                                                  "2026-05-29T08:50:00", "8:50 AM", false),
    ],
  },

  // ── 4. Elena Vasquez — WhatsApp lead ───────────────────────
  {
    id: "c4",
    clientName: "Elena Vasquez", clientInitials: "EV", clientColor: "#F59E0B",
    clientPhone: "(305) 555-0204",
    tag: "lead", channel: "whatsapp", isHighIntent: true,
    propertyAddress: "100 S Pointe Dr, Miami Beach",
    lastMessage: "The terrace view sold me. What's the best offer strategy?",
    lastTimestamp: "2026-05-28T20:10:00", displayTime: "Yesterday, 8:10 PM",
    unreadCount: 2,
    messages: [
      msg("m4-1", "client", "whatsapp", "Elena Vasquez", "Chris! I toured 100 S Pointe today on my own — the building is gorgeous.",                                        "2026-05-28T17:30:00", "Yesterday, 5:30 PM"),
      msg("m4-2", "agent",  "whatsapp", ME,             "Great eye, Elena! That unit rarely comes available. The terrace alone is worth the price.",                         "2026-05-28T17:45:00", "Yesterday, 5:45 PM"),
      msg("m4-3", "client", "whatsapp", "Elena Vasquez", "Asking $3.6M — is there room to negotiate?",                                                                       "2026-05-28T19:55:00", "Yesterday, 7:55 PM"),
      msg("m4-4", "client", "whatsapp", "Elena Vasquez", "The terrace view sold me. What's the best offer strategy?",                                                         "2026-05-28T20:10:00", "Yesterday, 8:10 PM", false),
    ],
  },

  // ── 5. Michael Torres — transaction, showing feedback ──────
  {
    id: "c5",
    clientName: "Michael Torres", clientInitials: "MT", clientColor: "#8B5CF6",
    clientEmail: "m.torres@email.com",
    tag: "transaction", channel: "email",
    subject: "Showing Feedback — 3420 Main Hwy",
    propertyAddress: "3420 Main Hwy, Coconut Grove",
    lastMessage: "Two of the three buyers asked about HOA fees. I'll follow up Monday.",
    lastTimestamp: "2026-05-27T16:20:00", displayTime: "Tue, 4:20 PM",
    unreadCount: 0,
    messages: [
      msg("m5-1", "agent",  "email", ME,             "Michael, we had 3 showings today on Main Hwy. Overall positive reactions. Sending you a summary.",  "2026-05-27T14:00:00", "Tue, 2:00 PM"),
      msg("m5-2", "system", "system", "AxenOne",      "Showing logged: 3 groups — 1:00 PM, 2:30 PM, 4:00 PM",                                              "2026-05-27T14:05:00", "Tue, 2:05 PM"),
      msg("m5-3", "client", "email", "Michael Torres","Any offers incoming? The 4:00 group seemed very interested.",                                        "2026-05-27T15:50:00", "Tue, 3:50 PM"),
      msg("m5-4", "agent",  "email", ME,             "Two of the three buyers asked about HOA fees. I'll follow up Monday.",                                "2026-05-27T16:20:00", "Tue, 4:20 PM"),
    ],
  },

  // ── 6. Premier Realty Co — referral ────────────────────────
  {
    id: "c6",
    clientName: "Premier Realty Co", clientInitials: "PR", clientColor: "#0EA5E9",
    clientEmail: "partnerships@premierrealty.com",
    tag: "referral", channel: "email",
    subject: "Referral Partnership Proposal",
    lastMessage: "We'd love to formalize the referral arrangement. 25% fee sounds fair.",
    lastTimestamp: "2026-05-27T11:00:00", displayTime: "Tue, 11:00 AM",
    unreadCount: 0,
    messages: [
      msg("m6-1", "client", "email", "Premier Realty", "Hi Chris, our agent referred a client to you last month and the deal closed — great work!",       "2026-05-26T09:00:00", "Mon, 9:00 AM"),
      msg("m6-2", "agent",  "email", ME,              "Thanks! Your client was a pleasure. We'd love to build a formal referral pipeline together.",       "2026-05-26T10:30:00", "Mon, 10:30 AM"),
      msg("m6-3", "client", "email", "Premier Realty", "We'd love to formalize the referral arrangement. 25% fee sounds fair.",                           "2026-05-27T11:00:00", "Tue, 11:00 AM"),
    ],
  },

  // ── 7. David Chen — mortgage inquiry ───────────────────────
  {
    id: "c7",
    clientName: "David Chen", clientInitials: "DC", clientColor: "#14B8A6",
    clientPhone: "(305) 555-0207",
    tag: "mortgage", channel: "sms",
    lastMessage: "That rate sounds very competitive. Can we meet Thursday?",
    lastTimestamp: "2026-05-27T14:30:00", displayTime: "Tue, 2:30 PM",
    unreadCount: 0,
    messages: [
      msg("m7-1", "client", "sms", "David Chen", "Hi, I was told Axen Realty also handles mortgages? I'm looking to buy a $1.2M property.",          "2026-05-26T11:00:00", "Mon, 11:00 AM"),
      msg("m7-2", "agent",  "sms", ME,           "Hi David! Yes — we have an in-house mortgage team. Current rates start at 6.75% for your range.", "2026-05-26T11:20:00", "Mon, 11:20 AM"),
      msg("m7-3", "client", "sms", "David Chen", "That rate sounds very competitive. Can we meet Thursday?",                                        "2026-05-27T14:30:00", "Tue, 2:30 PM"),
    ],
  },

  // ── 8. Lisa Anderson — price reduction discussion ──────────
  {
    id: "c8",
    clientName: "Lisa Anderson", clientInitials: "LA", clientColor: "#EF4444",
    clientEmail: "lisa.a@email.com",
    tag: "transaction", channel: "email",
    subject: "9801 Collins Ave — Pricing Strategy",
    propertyAddress: "9801 Collins Ave #3F, Miami Beach",
    lastMessage: "I'm okay with a $50K reduction if we can get it under contract this week.",
    lastTimestamp: "2026-05-26T15:00:00", displayTime: "Mon, 3:00 PM",
    unreadCount: 0,
    messages: [
      msg("m8-1", "agent",  "email", ME,            "Lisa, we've had 4 showings in 3 weeks with no offers. I'd recommend a pricing strategy discussion.",   "2026-05-25T10:00:00", "Sun, 10:00 AM"),
      msg("m8-2", "client", "email", "Lisa Anderson","What do you suggest? I don't want to go below $1.75M.",                                               "2026-05-25T12:30:00", "Sun, 12:30 PM"),
      msg("m8-3", "agent",  "email", ME,            "Comps support $1.76M–$1.80M. A 2–3% reduction to $1.78M would bring competitive buyers back.",        "2026-05-26T09:00:00", "Mon, 9:00 AM"),
      msg("m8-4", "client", "email", "Lisa Anderson","I'm okay with a $50K reduction if we can get it under contract this week.",                            "2026-05-26T15:00:00", "Mon, 3:00 PM"),
    ],
  },

  // ── 9. Robert Kim — referral from Maria Santos ─────────────
  {
    id: "c9",
    clientName: "Robert Kim", clientInitials: "RK", clientColor: "#A855F7",
    clientEmail: "robert.kim@email.com",
    tag: "referral", channel: "email",
    subject: "Referral from Maria Santos — Brickell Buyer",
    lastMessage: "Looking at $2M–$2.5M range, modern finishes. Flexible on timeline.",
    lastTimestamp: "2026-05-25T11:30:00", displayTime: "May 25",
    unreadCount: 0,
    messages: [
      msg("m9-1", "client", "email", "Robert Kim",  "Hi Chris, Maria Santos referred me to you. I'm relocating from New York and need help finding a Brickell condo.", "2026-05-25T09:00:00", "May 25, 9:00 AM"),
      msg("m9-2", "agent",  "email", ME,            "Robert! Maria speaks very highly of you. Welcome to Miami — I'd love to help you find the perfect place.",        "2026-05-25T10:00:00", "May 25, 10:00 AM"),
      msg("m9-3", "client", "email", "Robert Kim",  "Looking at $2M–$2.5M range, modern finishes. Flexible on timeline.",                                              "2026-05-25T11:30:00", "May 25, 11:30 AM"),
    ],
  },

  // ── 10. Sarah Johnson — new Zillow lead ────────────────────
  {
    id: "c10",
    clientName: "Sarah Johnson", clientInitials: "SJ", clientColor: "#84CC16",
    clientPhone: "(305) 555-0210",
    tag: "lead", channel: "sms",
    lastMessage: "Yes please! We're first-time buyers and not sure where to start.",
    lastTimestamp: "2026-05-25T09:30:00", displayTime: "May 25",
    unreadCount: 0,
    messages: [
      msg("m10-1", "system", "system", "AxenOne",      "New Zillow lead assigned: Sarah Johnson — searching for 3BR in Kendall/Doral area, budget $600K",              "2026-05-25T08:00:00", "May 25, 8:00 AM"),
      msg("m10-2", "agent",  "sms",   ME,              "Hi Sarah! I'm Chris from Axen Realty. I saw you were searching in Kendall — I specialize in that area! Can I help?", "2026-05-25T08:15:00", "May 25, 8:15 AM"),
      msg("m10-3", "client", "sms",   "Sarah Johnson", "Yes please! We're first-time buyers and not sure where to start.",                                                 "2026-05-25T09:30:00", "May 25, 9:30 AM"),
    ],
  },

  // ── 11. Carlos Mendez — mortgage rate inquiry ──────────────
  {
    id: "c11",
    clientName: "Carlos Mendez", clientInitials: "CM2", clientColor: "#F97316",
    clientPhone: "(305) 555-0211",
    tag: "mortgage", channel: "sms",
    lastMessage: "What documents do I need for pre-qualification?",
    lastTimestamp: "2026-05-22T16:00:00", displayTime: "May 22",
    unreadCount: 0,
    messages: [
      msg("m11-1", "client", "sms", "Carlos Mendez", "Hi, interested in a mortgage for a $900K townhome. Current rates?",           "2026-05-22T14:30:00", "May 22, 2:30 PM"),
      msg("m11-2", "agent",  "sms", ME,             "Hi Carlos! For that range, we're seeing 6.875%–7.125% on 30yr fixed. Great time to lock.", "2026-05-22T15:00:00", "May 22, 3:00 PM"),
      msg("m11-3", "client", "sms", "Carlos Mendez", "What documents do I need for pre-qualification?",                             "2026-05-22T16:00:00", "May 22, 4:00 PM"),
    ],
  },

  // ── 12. Jennifer Wu — closed deal, post-closing ────────────
  {
    id: "c12",
    clientName: "Jennifer Wu", clientInitials: "JW", clientColor: "#6366F1",
    clientEmail: "jen.wu@email.com",
    tag: "transaction", channel: "email",
    subject: "Congratulations on your new home! 🎉",
    propertyAddress: "612 Majorca Ave, Coral Gables",
    lastMessage: "We absolutely love it! Already recommending you to everyone.",
    lastTimestamp: "2026-05-20T10:00:00", displayTime: "May 20",
    unreadCount: 0,
    messages: [
      msg("m12-1", "agent",  "email", ME,           "Jennifer! Congratulations on closing on your beautiful new home at 612 Majorca. It was a pleasure working with you!", "2026-05-20T09:00:00", "May 20, 9:00 AM"),
      msg("m12-2", "client", "email", "Jennifer Wu", "Chris, we're speechless. The house is even more stunning in person. Thank you for everything.",                       "2026-05-20T09:45:00", "May 20, 9:45 AM"),
      msg("m12-3", "agent",  "email", ME,           "You're going to love the neighborhood! Don't hesitate to reach out whenever you need anything.",                      "2026-05-20T09:55:00", "May 20, 9:55 AM"),
      msg("m12-4", "client", "email", "Jennifer Wu", "We absolutely love it! Already recommending you to everyone.",                                                        "2026-05-20T10:00:00", "May 20, 10:00 AM"),
    ],
  },

  // ── 13. Aisha Williams — team internal ─────────────────────
  {
    id: "c13",
    clientName: "Aisha Williams", clientInitials: "AW", clientColor: "#3B82F6",
    clientEmail: "aisha.williams@axenrealty.com",
    tag: "team", channel: "email",
    subject: "Team — Tyler Brooks onboarding check",
    lastMessage: "Tyler will be ready to shadow by next Monday. I'll assign him to my next listing appointment.",
    lastTimestamp: "2026-05-22T11:30:00", displayTime: "May 22",
    unreadCount: 0,
    messages: [
      msg("m13-1", "agent",  "email", ME,              "Aisha, how is Tyler's onboarding coming along? Want to make sure he has a smooth start.",                    "2026-05-22T09:00:00", "May 22, 9:00 AM"),
      msg("m13-2", "client", "email", "Aisha Williams", "He completed all his MLS training yesterday. Working through CRM setup now.",                               "2026-05-22T10:30:00", "May 22, 10:30 AM"),
      msg("m13-3", "client", "email", "Aisha Williams", "Tyler will be ready to shadow by next Monday. I'll assign him to my next listing appointment.",             "2026-05-22T11:30:00", "May 22, 11:30 AM"),
    ],
  },

  // ── 14. Axen System — notifications ────────────────────────
  {
    id: "c14",
    clientName: "AxenOne System", clientInitials: "AX", clientColor: "#D4AF37",
    tag: "team", channel: "system",
    subject: "Automated Alerts",
    lastMessage: "Reminder: 3 listing agreements expire in the next 30 days.",
    lastTimestamp: "2026-05-29T07:00:00", displayTime: "7:00 AM",
    unreadCount: 1,
    messages: [
      msg("m14-1", "system", "system", "AxenOne", "New lead assigned from Zillow: Patricia Nguyen — Coral Gables buyer, $2.8M budget",                    "2026-05-28T08:00:00", "Yesterday, 8:00 AM"),
      msg("m14-2", "system", "system", "AxenOne", "Transaction milestone: Maria Rodriguez — Closing Disclosure received and sent to client",               "2026-05-29T06:00:00", "6:00 AM"),
      msg("m14-3", "system", "system", "AxenOne", "Reminder: 3 listing agreements expire in the next 30 days.",                                           "2026-05-29T07:00:00", "7:00 AM", false),
    ],
  },

  // ── 15. Marcus Rivera — team agent note ────────────────────
  {
    id: "c15",
    clientName: "Marcus Rivera", clientInitials: "MR2", clientColor: "#F59E0B",
    clientEmail: "marcus.rivera@axenrealty.com",
    tag: "team", channel: "email",
    subject: "Shared buyer — Westchester showing",
    lastMessage: "Got it. I'll follow up with the buyer and cc you on the email.",
    lastTimestamp: "2026-05-15T14:00:00", displayTime: "May 15",
    unreadCount: 0,
    messages: [
      msg("m15-1", "client", "email", "Marcus Rivera", "Chris, one of my Westchester buyers saw your listing on SW 37th. Would it be okay to co-op?",          "2026-05-15T10:00:00", "May 15, 10:00 AM"),
      msg("m15-2", "agent",  "email", ME,             "Absolutely Marcus, happy to co-op. Standard 50/50 split on the buyer side. Let's make it work.",        "2026-05-15T11:00:00", "May 15, 11:00 AM"),
      msg("m15-3", "client", "email", "Marcus Rivera", "Got it. I'll follow up with the buyer and cc you on the email.",                                        "2026-05-15T14:00:00", "May 15, 2:00 PM"),
    ],
  },
];

// ─── AI suggestions by conversation tag ──────────────────────
export const AI_SUGGESTIONS: Record<string, string[]> = {
  lead: [
    "Hi! Thanks for reaching out. I have properties that match your criteria — would you like to schedule a showing this week?",
    "Great to hear from you! I'm available for a call today to walk you through the market. What time works?",
    "I just sent you a curated list of properties based on your preferences. Let me know if any catch your eye!",
  ],
  transaction: [
    "Everything is on track for closing. I'll send the final checklist tomorrow — let me know if you have any questions.",
    "I've reviewed the document and it looks good. I'll prepare the counter-proposal for your signature shortly.",
    "Just checking in on the inspection items. Have you had a chance to review the report with your attorney?",
  ],
  referral: [
    "Thank you for the introduction! I've reached out to your contact and we're scheduling a consultation.",
    "Happy to collaborate. I'll send the referral agreement over for your review — standard 25% fee.",
    "Great connection — I'll take excellent care of them and keep you posted on progress.",
  ],
  team: [
    "Got it — I'll take care of this today and update the CRM.",
    "Thanks for the heads up! I'll coordinate with the client directly and loop you in.",
    "On it! I'll have an update to you by end of day.",
  ],
  mortgage: [
    "Hi! Our team can get you pre-qualified quickly. I'll need a few documents — when are you available for a quick call?",
    "Based on your profile, you may qualify for our jumbo loan program at very competitive rates. Let's discuss.",
    "I've reviewed your initial inquiry. You're in a great position — let me run the full numbers and get back to you.",
  ],
};
