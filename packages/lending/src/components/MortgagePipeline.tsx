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
import type { MortgageApplication, LoanStage } from "@dravik/contracts/lending";
import ApplicationCard, { ApplicationCardContent } from "./ApplicationCard";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Stage config ─────────────────────────────────────────────
interface StageConfig {
  id:     LoanStage;
  label:  string;
  color:  string;
  dot:    string;
}

const STAGES: StageConfig[] = [
  { id: "pre-qual",     label: "Pre-Qual Submitted",    color: "#6366F1", dot: "bg-indigo-400"  },
  { id: "application",  label: "Application Complete",  color: "#3B82F6", dot: "bg-blue-400"    },
  { id: "underwriting", label: "Underwriting",          color: "#F59E0B", dot: "bg-amber-400"   },
  { id: "approved",     label: "Approved / Conditional",color: "#10B981", dot: "bg-emerald-400" },
  { id: "closing",      label: "Closing / Funded",      color: "#C9C3B6", dot: "bg-gold"        },
];
const STAGE_IDS = new Set(STAGES.map((s) => s.id));

// ─── Kanban column ────────────────────────────────────────────
function KanbanCol({
  stage,
  apps,
  onSelect,
}: {
  stage:    StageConfig;
  apps:     MortgageApplication[];
  onSelect: (app: MortgageApplication) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = apps.reduce((s, a) => s + a.loanAmount, 0);

  return (
    <div className="flex-shrink-0 w-[272px] flex flex-col h-full">
      {/* Column header */}
      <div className="flex-shrink-0 flex items-start justify-between px-2 py-2.5 mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", stage.dot)} />
          <div>
            <p className="text-xs font-bold text-dravik-dark leading-tight">{stage.label}</p>
            {apps.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                {formatCurrency(total)}
              </p>
            )}
          </div>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${stage.color}18`, color: stage.color }}
        >
          {apps.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[120px] rounded-2xl px-2 py-2 space-y-3 overflow-y-auto transition-colors duration-150",
          isOver ? "bg-gold/5 ring-2 ring-gold/20" : "bg-surface-2"
        )}
      >
        <SortableContext
          items={apps.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} onSelect={onSelect} />
          ))}
        </SortableContext>

        {apps.length === 0 && (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-gray-300 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pipeline board ───────────────────────────────────────────
interface Props {
  applications:    MortgageApplication[];
  setApplications: React.Dispatch<React.SetStateAction<MortgageApplication[]>>;
  onSelect:        (app: MortgageApplication) => void;
}

export default function MortgagePipeline({ applications, setApplications, onSelect }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragOriginStage = useRef<LoanStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  const isStageId = useCallback((id: string) => STAGE_IDS.has(id as LoanStage), []);

  const getTargetStage = useCallback(
    (overId: string): LoanStage | undefined => {
      if (isStageId(overId)) return overId as LoanStage;
      return applications.find((a) => a.id === overId)?.stage;
    },
    [isStageId, applications]
  );

  // ── Handlers ─────────────────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    const id = String(active.id);
    setActiveId(id);
    dragOriginStage.current = applications.find((a) => a.id === id)?.stage ?? null;
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    if (aId === oId) return;

    const activeApp   = applications.find((a) => a.id === aId);
    const targetStage = getTargetStage(oId);
    if (!activeApp || !targetStage) return;
    if (activeApp.stage === targetStage) return;

    setApplications((prev) => {
      const updated = prev.map((a) =>
        a.id === aId ? { ...a, stage: targetStage } : a
      );
      if (!isStageId(oId)) {
        const col      = updated.filter((a) => a.stage === targetStage);
        const fromIdx  = col.findIndex((a) => a.id === aId);
        const toIdx    = col.findIndex((a) => a.id === oId);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          const reordered = arrayMove(col, fromIdx, toIdx);
          const colIds    = new Set(col.map((a) => a.id));
          let cursor      = 0;
          return updated.map((a) =>
            a.stage === targetStage && colIds.has(a.id) ? reordered[cursor++] : a
          );
        }
      }
      return updated;
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const origStage = dragOriginStage.current;
    setActiveId(null);
    dragOriginStage.current = null;

    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    if (aId === oId) return;

    const app = applications.find((a) => a.id === aId);
    if (!app) return;
    if (app.stage !== origStage) return; // cross-column already handled in onDragOver

    // Same-column reorder
    if (!isStageId(oId)) {
      const over = applications.find((a) => a.id === oId);
      if (over && over.stage === app.stage) {
        const col    = app.stage;
        const colArr = applications.filter((a) => a.stage === col);
        const oldIdx = colArr.findIndex((a) => a.id === aId);
        const newIdx = colArr.findIndex((a) => a.id === oId);
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          const reordered = arrayMove(colArr, oldIdx, newIdx);
          const colIds    = new Set(colArr.map((a) => a.id));
          let cursor      = 0;
          setApplications((prev) =>
            prev.map((a) =>
              a.stage === col && colIds.has(a.id) ? reordered[cursor++] : a
            )
          );
        }
      }
    }
  }

  function onDragCancel() {
    setActiveId(null);
    dragOriginStage.current = null;
  }

  // Exclude declined from kanban display
  const visibleApps = applications.filter((a) => a.stage !== "declined");

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
          {STAGES.map((stage) => (
            <KanbanCol
              key={stage.id}
              stage={stage}
              apps={visibleApps.filter((a) => a.stage === stage.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <DragOverlay
        dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
      >
        {activeApp && (
          <div className="w-[272px]">
            <ApplicationCardContent app={activeApp} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
