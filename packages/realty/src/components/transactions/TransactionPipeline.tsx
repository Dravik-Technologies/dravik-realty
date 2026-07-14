"use client";

import { useEffect, useState, useRef } from "react";
import {
  DndContext, closestCorners, DragOverlay,
  useSensor, useSensors, PointerSensor, KeyboardSensor,
  useDroppable,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove,
  verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Transaction, PipelineStage } from "@dravik/contracts/realty";
import { PIPELINE_STAGES, STAGE_PROGRESS } from "@dravik/contracts/realty";
import TransactionCard, { STAGE_COLOR } from "./TransactionCard";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Column label map ─────────────────────────────────────────
const STAGE_LABEL: Record<PipelineStage, string> = {
  "Under Contract":    "Under Contract",
  "Inspections":       "Inspections / Contingencies",
  "Financing Approved":"Financing Approved",
  "Appraisal / Title": "Appraisal / Title",
  "Closing / Funded":  "Closing / Funded",
};

// ─── Compact currency ─────────────────────────────────────────
function compactCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return formatCurrency(n);
}

// ─── Stage column (module level) ─────────────────────────────
interface StageColumnProps {
  stage: PipelineStage;
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (t: Transaction) => void;
}

function StageColumn({ stage, transactions, selectedId, onSelect }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const color   = STAGE_COLOR[stage];
  const volume  = transactions.reduce((s, t) => s + t.contractPrice, 0);
  const ids     = transactions.map((t) => t.id);

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col">
      {/* Column header */}
      <div className="mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <p className="text-xs font-bold text-dravik-dark leading-tight flex-1 min-w-0">
            {STAGE_LABEL[stage]}
          </p>
          <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: color }}>
            {transactions.length}
          </span>
        </div>
        {volume > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5 pl-4">{compactCurrency(volume)}</p>
        )}
        {/* Stage progress line */}
        <div className="mt-2 h-0.5 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${STAGE_PROGRESS[stage]}%`, background: color }} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-2xl p-2 space-y-2 min-h-[80px] transition-colors overflow-y-auto max-h-[calc(100vh-320px)]",
          isOver ? "bg-gold-light ring-2 ring-gold/30" : "bg-surface-2"
        )}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {transactions.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              selected={selectedId === t.id}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Drag ghost (module level) ────────────────────────────────
function TxDragGhost({ transaction }: { transaction: Transaction }) {
  return (
    <TransactionCard
      transaction={transaction}
      selected={false}
      onSelect={() => {}}
      overlay
    />
  );
}

// ─── Main pipeline ────────────────────────────────────────────
interface TransactionPipelineProps {
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (t: Transaction) => void;
}

function isStageId(id: string): id is PipelineStage {
  return PIPELINE_STAGES.includes(id as PipelineStage);
}

export default function TransactionPipeline({
  transactions: initialTransactions,
  selectedId,
  onSelect,
}: TransactionPipelineProps) {
  const [txns, setTxns]       = useState<Transaction[]>(initialTransactions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragOriginStage         = useRef<PipelineStage | null>(null);

  useEffect(() => {
    setTxns(initialTransactions);
  }, [initialTransactions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setActiveId(id);
    dragOriginStage.current = txns.find((t) => t.id === id)?.stage ?? null;
  }

  function handleDragOver(e: DragOverEvent) {
    const activeId = String(e.active.id);
    const overId   = String(e.over?.id ?? "");
    if (!overId || activeId === overId) return;

    const activeItem = txns.find((t) => t.id === activeId);
    if (!activeItem) return;

    const targetStage: PipelineStage = isStageId(overId)
      ? overId
      : (txns.find((t) => t.id === overId)?.stage ?? activeItem.stage);

    if (targetStage === activeItem.stage && isStageId(overId)) return;

    setTxns((prev) => {
      const updated = prev.map((t) =>
        t.id === activeId ? { ...t, stage: targetStage } : t
      );
      if (!isStageId(overId)) {
        const colItems = updated.filter((t) => t.stage === targetStage);
        const fromIdx  = colItems.findIndex((t) => t.id === activeId);
        const toIdx    = colItems.findIndex((t) => t.id === overId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          const reordered = arrayMove(colItems, fromIdx, toIdx);
          const colIds    = new Set(colItems.map((t) => t.id));
          let cursor      = 0;
          return updated.map((t) =>
            t.stage === targetStage && colIds.has(t.id) ? reordered[cursor++] : t
          );
        }
      }
      return updated;
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    dragOriginStage.current = null;
    if (!over || active.id === over.id) return;

    const activeItem = txns.find((t) => t.id === String(active.id));
    if (!activeItem) return;

    const overId      = String(over.id);
    const targetStage = isStageId(overId) ? overId : txns.find((t) => t.id === overId)?.stage;
    if (!targetStage || targetStage !== activeItem.stage) return;

    setTxns((prev) => {
      const colItems = prev.filter((t) => t.stage === targetStage);
      const fromIdx  = colItems.findIndex((t) => t.id === String(active.id));
      const toIdx    = colItems.findIndex((t) => t.id === overId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const reordered = arrayMove(colItems, fromIdx, toIdx);
      const colIds    = new Set(colItems.map((t) => t.id));
      let cursor      = 0;
      return prev.map((t) =>
        t.stage === targetStage && colIds.has(t.id) ? reordered[cursor++] : t
      );
    });
  }

  function handleDragCancel() {
    setActiveId(null);
    dragOriginStage.current = null;
  }

  const activeItem = txns.find((t) => t.id === activeId);

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 p-5 h-full min-w-max">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {PIPELINE_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              transactions={txns.filter((t) => t.stage === stage)}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
          <DragOverlay>
            {activeItem && <TxDragGhost transaction={activeItem} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
