export type Channel        = "sms" | "email" | "whatsapp" | "call" | "system";
export type MessageRole    = "agent" | "client" | "system";
export type ConversationTag = "lead" | "transaction" | "referral" | "team" | "mortgage";
export type InboxFolder    = "all" | "unread" | "leads" | "transactions" | "referrals" | "team" | "mortgage";
export type QuickFilter    = "all" | "today" | "this-week" | "high-intent";

export interface Attachment {
  id:   string;
  name: string;
  type: "image" | "pdf" | "doc";
  size: string;
}

export interface Message {
  id:          string;
  role:        MessageRole;
  channel:     Channel;
  senderName:  string;
  subject?:    string;     // email only
  content:     string;
  timestamp:   string;     // ISO – kept for sort stability, never rendered directly
  displayTime: string;     // precomputed, SSR-safe
  read:        boolean;
  attachments?: Attachment[];
}

export interface Conversation {
  id:               string;
  clientName:       string;
  clientInitials:   string;
  clientColor:      string;
  clientPhone?:     string;
  clientEmail?:     string;
  tag:              ConversationTag;
  channel:          Channel;         // primary / latest channel
  subject?:         string;          // email subject line
  propertyAddress?: string;
  lastMessage:      string;          // preview snippet
  lastTimestamp:    string;          // ISO
  displayTime:      string;          // precomputed
  unreadCount:      number;
  isHighIntent?:    boolean;
  assignedTo?:      string;
  messages:         Message[];
}
