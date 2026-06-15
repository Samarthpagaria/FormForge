"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin, 
  useSensor, 
  useSensors, 
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  useDroppable,
  MeasuringStrategy,
  rectIntersection,
  CollisionDetection
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { FieldPalette } from "@/components/builder/field-palette";
import { FieldSettings } from "@/components/builder/field-settings";
import { FieldCard, EmptySlot } from "@/components/builder/field-card";
import { useFormBuilderStore, FieldType } from "@/stores/useFormBuilderStore";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconSettings,
  IconEye,
  IconDeviceFloppy,
  IconUpload,
  IconForms,
} from "@tabler/icons-react";

// ─── Droppable Empty Slot ─────────────────────────────────────────
// A half-width drop target that appears next to unpaired half-width fields.
// Dropping into this slot inserts the new field as half-width at that position.
function DroppableEmptySlot({ afterFieldId }: { afterFieldId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-slot-${afterFieldId}`,
    data: { type: "empty-slot", afterFieldId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`col-span-6 min-h-[100px] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 select-none ${
        isOver
          ? "border-violet-400 bg-violet-50/20"
          : "border-neutral-200 bg-neutral-50/60"
      }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
        isOver ? "bg-violet-100" : "bg-neutral-100"
      }`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isOver ? "#7c3aed" : "#a3a3a3"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <p className={`text-[11px] font-semibold tracking-wide uppercase transition-colors ${
        isOver ? "text-violet-600" : "text-neutral-400"
      }`}>
        {isOver ? "Drop here!" : "Half-width slot"}
      </p>
    </div>
  );
}

// ─── Canvas Drop Zone ────────────────────────────────────────────
// useDroppable MUST be called inside <DndContext> — separate component ensures that
function CanvasDropZone() {
  const { fields, setActiveField, activeElementId, removeField, duplicateField } = useFormBuilderStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
    data: { type: "canvas" },
  });

  // Walk through fields pairing consecutive half-width fields.
  // Any half-width field without a half-width partner gets an EmptySlot injected inline.
  const renderList: React.ReactNode[] = [];
  let fi = 0;
  while (fi < fields.length) {
    const field = fields[fi];
    const makeCard = (f: typeof field) => (
      <FieldCard
        key={f.id}
        id={f.id}
        type={f.type}
        label={f.label}
        placeholder={f.placeholder}
        helpText={f.helpText}
        required={f.required}
        width={f.width}
        state={activeElementId === f.id ? "selected" : "default"}
        onClick={(e) => { e.stopPropagation(); setActiveField(f.id); }}
        onDelete={() => removeField(f.id)}
        onDuplicate={() => duplicateField(f.id)}
      />
    );

    if (field.width === "half") {
      renderList.push(makeCard(field));
      const next = fields[fi + 1];
      if (next?.width === "half") {
        renderList.push(makeCard(next));
        fi += 2;
      } else {
        // Unpaired half — fill remaining 6 columns with droppable slot
        renderList.push(<DroppableEmptySlot key={`slot-${field.id}`} afterFieldId={field.id} />);
        fi += 1;
      }
    } else {
      renderList.push(makeCard(field));
      fi += 1;
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-2xl border-2 transition-all duration-200 overflow-y-auto custom-scrollbar p-8 flex flex-col ${
        isOver
          ? "border-violet-400 bg-violet-50/20 shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
          : "border-neutral-200 bg-white shadow-sm"
      }`}
    >
      {fields.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] pointer-events-none">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${isOver ? "bg-violet-100" : "bg-neutral-100"}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={isOver ? "#7c3aed" : "#a3a3a3"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className={`text-base font-semibold mb-1.5 transition-colors ${isOver ? "text-violet-700" : "text-neutral-500"}`}>
            {isOver ? "Release to add!" : "Drag a field here"}
          </p>
          <p className="text-sm text-neutral-400">Pick a field from the left panel to get started</p>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto flex flex-col">
          <SortableContext items={fields.map(f => f.id)} strategy={rectSortingStrategy}>
            <div
              className="grid grid-cols-12 gap-4 w-full content-start"
              onClick={(e) => { if (e.target === e.currentTarget) setActiveField(null); }}
            >
              {renderList}
            </div>
          </SortableContext>

          <div className="mt-8 flex items-center justify-center">
            <button className="px-5 py-2 text-xs font-semibold text-neutral-400 bg-transparent hover:bg-neutral-100 rounded-xl transition-colors border border-dashed border-neutral-300 hover:border-neutral-400 hover:text-neutral-600">
              + Add Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Builder UI ──────────────────────────────────────────────────
function BuilderUI() {
  const { fields, addField, reorderFields } = useFormBuilderStore();

  const dockLinks = [
    {
      title: "Build Mode",
      icon: <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Preview Form",
      icon: <IconEye className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Save Draft",
      icon: <IconDeviceFloppy className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Publish",
      icon: <IconUpload className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Form Name Settings",
      icon: <IconForms className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
  ];

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<"palette" | "canvas" | null>(null);
  const [activeDragFieldType, setActiveDragFieldType] = useState<FieldType | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isPalette = active.data.current?.type === "palette-item";
    setActiveDragId(active.id as string);
    setActiveDragType(isPalette ? "palette" : "canvas");
    if (isPalette) setActiveDragFieldType(active.data.current?.fieldType as FieldType);
  };

  const handleDragOver = (event: DragOverEvent) => { void event; };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);
    setActiveDragFieldType(null);

    if (!over) return;

    const isPaletteDrop = active.data.current?.type === "palette-item";
    if (isPaletteDrop) {
      const fieldType = active.data.current?.fieldType as FieldType;
      const overId = over.id.toString();

      // Dropped into a half-width empty slot — insert as half-width right after paired field
      if (overId.startsWith("empty-slot-")) {
        const afterFieldId = over.data.current?.afterFieldId as string;
        const afterIndex = fields.findIndex((f) => f.id === afterFieldId);
        addField(fieldType, afterIndex + 1, { width: "half" });
        return;
      }

      // Dropped on canvas background or on an existing field
      let dropIndex = fields.length;
      if (overId !== "canvas-drop-zone") {
        const idx = fields.findIndex((f) => f.id === overId);
        if (idx !== -1) dropIndex = idx;
      }
      addField(fieldType, dropIndex);
    } else {
      const activeId = active.id as string;
      const overId = over.id as string;
      if (activeId !== overId && overId !== "canvas-drop-zone") {
        reorderFields(activeId, overId);
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
  };

  return (
    // Sits below the fixed navbar (h-16 = 64px, z-50) at z-40
    // This lets the original DashboardNavbar show through at the top
    <div className="fixed inset-0 bg-neutral-50" style={{ zIndex: 40, top: 64 }}>
      <DndContext
        id="form-builder-dnd-context"
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Three-column layout with original dashboard-style padding */}
        <div className="flex gap-6 h-full px-6 py-5">

          {/* LEFT — Field Palette */}
          <div className="w-[260px] shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-hidden">
            <FieldPalette />
          </div>

          {/* CENTER — Canvas (CanvasDropZone handles useDroppable) */}
          <CanvasDropZone />

          {/* RIGHT — Field Settings */}
          <div className="w-[300px] shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-hidden">
            <FieldSettings />
          </div>

        </div>

        {/* ── Floating Dock Toolbar ── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <FloatingDock items={dockLinks} />
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragId ? (
            activeDragType === "palette" ? (
              <div className="w-[240px] opacity-90 rotate-1 scale-105 pointer-events-none">
                <FieldCard
                  type={activeDragFieldType!}
                  label={`New ${activeDragFieldType?.replace("_", " ")}`}
                  state="dragging"
                />
              </div>
            ) : (
              <div className="opacity-90 rotate-1 scale-105 w-[580px] pointer-events-none">
                {(() => {
                  const f = fields.find((f) => f.id === activeDragId);
                  if (!f) return null;
                  return <FieldCard type={f.type} label={f.label} placeholder={f.placeholder} helpText={f.helpText} required={f.required} width={f.width} state="dragging" />;
                })()}
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ─── Page Entry ──────────────────────────────────────────────────
export default function FormBuilderPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;
  // Portal renders directly into document.body — completely outside
  // the Framer Motion transform context of DashboardNavbar
  return createPortal(<BuilderUI />, document.body);
}
