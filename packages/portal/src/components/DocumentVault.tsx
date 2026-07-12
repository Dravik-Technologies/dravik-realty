"use client";

import { useState } from "react";
import {
  FileText, FileCheck, AlertCircle, Building2, DollarSign,
  User, Landmark, CheckCircle2, Clock, AlertTriangle,
  Upload, Eye, X,
} from "lucide-react";
import type { ClientDocument, ClientTransaction } from "@dravik/contracts/portal";
import { cn } from "@dravik/shared";

// ─── Icon map ─────────────────────────────────────────────────
const DOC_ICON: Record<ClientDocument["type"], React.ElementType> = {
  contract:   FileCheck,
  inspection: AlertCircle,
  appraisal:  Building2,
  disclosure: FileText,
  title:      FileCheck,
  loan:       DollarSign,
  id:         User,
  bank:       Landmark,
};

const STATUS_CONFIG = {
  signed:  { icon: CheckCircle2, label: "Signed",  cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending: { icon: Clock,        label: "Pending", cls: "text-amber-600  bg-amber-50  border-amber-200"    },
  needed:  { icon: AlertTriangle,label: "Needed",  cls: "text-rose-600   bg-rose-50   border-rose-200"     },
};

type VaultDocument = ClientDocument & { txAddress: string };

// ─── Document row (module level) ─────────────────────────────
function DocRow({
  doc: d,
  onPreview,
  onUpload,
}: {
  doc: VaultDocument;
  onPreview: (doc: VaultDocument) => void;
  onUpload: (doc: VaultDocument) => void;
}) {
  const Icon   = DOC_ICON[d.type];
  const status = STATUS_CONFIG[d.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-line hover:border-gold/20 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-dravik-dark truncate">{d.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {d.uploadedAt ? `Uploaded ${d.uploadedAt}` : d.dueDate ? `Due ${d.dueDate}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn(
          "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border",
          status.cls
        )}>
          <StatusIcon size={9} /> {status.label}
        </span>
        {d.status === "signed" && (
          <button
            onClick={() => onPreview(d)}
            aria-label={`Preview ${d.name}`}
            title={`Preview ${d.name}`}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-surface-2 text-gray-400 hover:text-gold transition-all"
          >
            <Eye size={12} />
          </button>
        )}
        {d.status === "needed" && (
          <button
            onClick={() => onUpload(d)}
            aria-label={`Upload ${d.name}`}
            title={`Upload ${d.name}`}
            className="flex items-center gap-1 px-2 py-1 bg-gold-light text-gold-dark text-[10px] font-bold rounded-lg hover:bg-gold hover:text-dravik-dark transition-colors"
          >
            <Upload size={10} /> Upload
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DocumentVault ────────────────────────────────────────────
interface Props {
  transactions: ClientTransaction[];
}

export default function DocumentVault({ transactions }: Props) {
  const [filterStatus, setFilterStatus] = useState<ClientDocument["status"] | "all">("all");
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set());
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  const allDocs: VaultDocument[] = transactions.flatMap((t) =>
    t.documents.map((d) => ({ ...d, txAddress: t.address }))
  );
  const effectiveDocs: VaultDocument[] = allDocs.map((d) =>
    uploadedIds.has(d.id)
      ? { ...d, status: "pending" as const, uploadedAt: "just now", dueDate: undefined }
      : d
  );

  const signedCount  = effectiveDocs.filter((d) => d.status === "signed").length;
  const pendingCount = effectiveDocs.filter((d) => d.status === "pending").length;
  const neededCount  = effectiveDocs.filter((d) => d.status === "needed").length;
  const pct          = effectiveDocs.length > 0 ? Math.round((signedCount / effectiveDocs.length) * 100) : 0;

  const filtered = filterStatus === "all" ? effectiveDocs : effectiveDocs.filter((d) => d.status === filterStatus);

  // Group by transaction
  const byTx = transactions.map((t) => ({
    tx: t,
    docs: filtered.filter((d) => d.transactionId === t.id),
  })).filter(({ docs }) => docs.length > 0);

  function handleUpload(doc: VaultDocument) {
    setUploadedIds((prev) => {
      const next = new Set(prev);
      next.add(doc.id);
      return next;
    });
    setPreviewDoc({ ...doc, status: "pending", uploadedAt: "just now", dueDate: undefined });
  }

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-line p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-dravik-dark">Document Vault</p>
          <span className="text-xs text-gray-400">{signedCount}/{allDocs.length} complete</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all",     label: `All (${allDocs.length})`,      cls: "bg-dravik-dark text-white" },
            { id: "signed",  label: `Signed (${signedCount})`,      cls: "bg-emerald-500 text-white" },
            { id: "pending", label: `Pending (${pendingCount})`,    cls: "bg-amber-400 text-white"   },
            { id: "needed",  label: `Needed (${neededCount})`,      cls: "bg-rose-500 text-white"    },
          ].map(({ id, label, cls }) => (
            <button
              key={id}
              onClick={() => setFilterStatus(id as typeof filterStatus)}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                filterStatus === id ? cls : "bg-surface-2 text-gray-400 hover:bg-surface"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload notice */}
      <div className="flex items-center gap-3 p-3 bg-gold-light rounded-xl border border-gold/20">
        <Upload size={14} className="text-gold flex-shrink-0" />
        <p className="text-xs text-dravik-dark">
          Use <strong>Upload</strong> on needed documents to stage them for agent review.
        </p>
      </div>

      {previewDoc && (
        <div aria-label="Client document preview" className="bg-white rounded-2xl border border-line p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
              <Eye size={15} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-dravik-dark">Previewing {previewDoc.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {previewDoc.txAddress} · {previewDoc.uploadedAt ? `Uploaded ${previewDoc.uploadedAt}` : `Due ${previewDoc.dueDate}`}
              </p>
            </div>
            <button
              onClick={() => setPreviewDoc(null)}
              aria-label="Close document preview"
              className="p-1.5 rounded-lg text-gray-400 hover:bg-surface-2 hover:text-dravik-dark transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Document groups */}
      {byTx.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No documents match this filter.</div>
      ) : (
        byTx.map(({ tx, docs }) => (
          <div key={tx.id}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {tx.address} — {tx.city}, {tx.state}
            </p>
            <div className="space-y-2">
              {docs.map((d) => (
                <DocRow key={d.id} doc={d} onPreview={setPreviewDoc} onUpload={handleUpload} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
