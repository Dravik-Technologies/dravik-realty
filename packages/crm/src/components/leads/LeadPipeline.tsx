"use client";

import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Lead, LeadStatus, KanbanColumn } from "@dravik/contracts/crm";
import { KANBAN_COLUMNS } from "@dravik/contracts/crm";
import LeadCard, { LeadCardContent } from "./LeadCard";
import { cn } from "@dravik/shared";

// ─── Single kanban column ─────────────────────────────────────
function KanbanCol({
  column,
  leads,
  onSelectLead,
}: {
  column: KanbanColumn;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-[280px] flex flex-col h-full">
      {/* Column header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: column.dotColor }}
          />
          <span className="text-sm font-bold text-axen-dark">{column.label}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `${column.accentColor}18`,
            color: column.accentColor,
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Drop zone + card list */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[120px] rounded-2xl px-2 py-2 space-y-3 overflow-y-auto transition-colors duration-150",
          isOver ? "bg-gold/5 ring-2 ring-gold/20" : "bg-surface-2"
        )}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
          ))}
        </SortableContext>

        {/* Empty state placeholder */}
        {leads.length === 0 && (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-gray-300 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main pipeline board ──────────────────────────────────────
interface LeadPipelineProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onSelectLead: (lead: Lead) => void;
}

export default function LeadPipeline({
  leads,
  setLeads,
  onSelectLead,
}: LeadPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragOriginStatus = useRef<LeadStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  // ── Helpers ────────────────────────────────────────────────
  const isColumnId = useCallback(
    (id: string) => KANBAN_COLUMNS.some((c) => c.id === id),
    []
  );

  const getTargetStatus = useCallback(
    (overId: string): LeadStatus | undefined => {
      if (isColumnId(overId)) return overId as LeadStatus;
      return leads.find((l) => l.id === overId)?.status;
    },
    [isColumnId, leads]
  );

  // ── Handlers ───────────────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    const id = String(active.id);
    setActiveId(id);
    dragOriginStatus.current = leads.find((l) => l.id === id)?.status ?? null;
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId   = String(over.id);
    if (activeId === overId) return;

    const activeCard   = leads.find((l) => l.id === activeId);
    const targetStatus = getTargetStatus(overId);

    if (!activeCard || !targetStatus) return;
    if (activeCard.status === targetStatus) return;

    // Live-preview: move card to target column, inserting at the hovered position
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === activeId ? { ...l, status: targetStatus } : l
      );

      // If hovering over a specific card (not a column droppable), reorder within target column
      if (!isColumnId(overId)) {
        const colItems  = updated.filter((l) => l.status === targetStatus);
        const fromIdx   = colItems.findIndex((l) => l.id === activeId);
        const toIdx     = colItems.findIndex((l) => l.id === overId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          const reordered  = arrayMove(colItems, fromIdx, toIdx);
          const colIds     = new Set(colItems.map((l) => l.id));
          let cursor       = 0;
          return updated.map((l) =>
            l.status === targetStatus && colIds.has(l.id) ? reordered[cursor++] : l
          );
        }
      }

      return updated;
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const origStatus = dragOriginStatus.current;
    setActiveId(null);
    dragOriginStatus.current = null;

    if (!over) return;

    const activeId = String(active.id);
    const overId   = String(over.id);
    if (activeId === overId) return;

    const activeCard = leads.find((l) => l.id === activeId);
    if (!activeCard) return;

    // If the card changed columns, onDragOver already committed status + position.
    if (activeCard.status !== origStatus) return;

    // Same-column reorder: finalize the drop position.
    if (!isColumnId(overId)) {
      const overCard = leads.find((l) => l.id === overId);
      if (overCard && overCard.status === activeCard.status) {
        const col    = activeCard.status;
        const colArr = leads.filter((l) => l.status === col);
        const oldIdx = colArr.findIndex((l) => l.id === activeId);
        const newIdx = colArr.findIndex((l) => l.id === overId);

        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          const reordered  = arrayMove(colArr, oldIdx, newIdx);
          const colIds     = new Set(colArr.map((l) => l.id));
          let cursor       = 0;
          setLeads((prev) =>
            prev.map((l) =>
              l.status === col && colIds.has(l.id) ? reordered[cursor++] : l
            )
          );
        }
      }
    }
  }

  function onDragCancel() {
    setActiveId(null);
    dragOriginStatus.current = null;
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="h-full px-6 py-4 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanCol
              key={col.id}
              column={col}
              leads={leads.filter((l) => l.status === col.id)}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
      </div>

      {/* Drag ghost */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeLead && (
          <div className="w-[280px]">
            <LeadCardContent lead={activeLead} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
