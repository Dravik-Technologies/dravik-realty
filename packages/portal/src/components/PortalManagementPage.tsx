import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ALL_CLIENTS } from "../data/client-portal";
import { cn } from "@dravik/shared";

const CLIENT_PORTAL_URL = "/portal";

function statusBadge(hasNeeds: boolean) {
  return hasNeeds
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function PortalManagementPage() {
  const clients = ALL_CLIENTS.map((data) => {
    const documents = data.transactions.flatMap((transaction) => transaction.documents);
    const neededDocs = documents.filter((document) => document.status === "needed").length;
    const pendingDocs = documents.filter((document) => document.status === "pending").length;
    const unreadMessages = data.messages.filter((message) => !message.read).length;
    const activeTransactions = data.transactions.filter((transaction) => transaction.status === "Active").length;

    return {
      data,
      activeTransactions,
      neededDocs,
      pendingDocs,
      unreadMessages,
      isReady: neededDocs === 0 && pendingDocs === 0,
    };
  });

  const activeClients = clients.filter((client) => client.activeTransactions > 0).length;
  const documentsNeeded = clients.reduce((sum, client) => sum + client.neededDocs, 0);
  const unreadMessages = clients.reduce((sum, client) => sum + client.unreadMessages, 0);
  const readyClients = clients.filter((client) => client.isReady).length;

  return (
    <div className="space-y-6">
      <section className="bg-axen-dark rounded-2xl p-6 text-white overflow-hidden relative">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gold/10 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-2">
              Realtor Tool
            </p>
            <h1 className="text-2xl font-bold">Client Portal Admin</h1>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl">
              Manage client access, document readiness, messages, and portal previews before clients enter their own portal.
            </p>
          </div>
          <a
            href={CLIENT_PORTAL_URL}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-axen-dark rounded-xl text-xs font-bold hover:bg-gold/90 transition-colors"
          >
            Preview Client Portal
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Clients", value: activeClients, icon: Users, accent: "#4A90A4" },
          { label: "Ready Portals", value: readyClients, icon: ShieldCheck, accent: "#10B981" },
          { label: "Docs Needed", value: documentsNeeded, icon: FileText, accent: "#F59E0B" },
          { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, accent: "#7C6A9E" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="bg-white border border-line rounded-2xl p-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${item.accent}18` }}
              >
                <Icon size={17} style={{ color: item.accent }} />
              </div>
              <p className="text-2xl font-bold text-axen-dark leading-none">{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          );
        })}
      </section>

      <section className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div>
            <h2 className="text-sm font-bold text-axen-dark">Client Access</h2>
            <p className="text-xs text-gray-400 mt-0.5">Portal readiness by client and transaction activity.</p>
          </div>
          <button
            disabled
            title="Client invitations coming soon"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 text-xs font-semibold text-gray-400 cursor-not-allowed"
          >
            <Mail size={13} />
            Invite Client
          </button>
        </div>

        <div className="divide-y divide-line">
          {clients.map(({ data, activeTransactions, neededDocs, pendingDocs, unreadMessages, isReady }) => (
            <div key={data.client.id} className="p-5 flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-axen-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm font-bold">
                    {data.client.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-axen-dark truncate">{data.client.name}</p>
                  <p className="text-xs text-gray-400 truncate">{data.client.email}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{data.client.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:w-[520px]">
                <div className="bg-surface-2 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Active</p>
                  <p className="text-sm font-bold text-axen-dark">{activeTransactions}</p>
                </div>
                <div className="bg-surface-2 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Needed</p>
                  <p className="text-sm font-bold text-axen-dark">{neededDocs}</p>
                </div>
                <div className="bg-surface-2 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Pending</p>
                  <p className="text-sm font-bold text-axen-dark">{pendingDocs}</p>
                </div>
                <div className="bg-surface-2 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Unread</p>
                  <p className="text-sm font-bold text-axen-dark">{unreadMessages}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 xl:w-[250px] xl:justify-end">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-bold",
                    statusBadge(!isReady)
                  )}
                >
                  {isReady ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {isReady ? "Ready" : "Needs Review"}
                </span>
                <a
                  href={CLIENT_PORTAL_URL}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-xs font-semibold text-gray-500 hover:text-axen-dark hover:border-axen-dark transition-colors"
                >
                  Preview
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
