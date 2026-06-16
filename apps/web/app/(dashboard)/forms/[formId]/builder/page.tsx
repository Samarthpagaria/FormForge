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
import { Settings, Eye, ChevronRight, GripVertical, Plus, Trash2, PlusCircle, ArrowLeft, Save, Send, Undo, Redo, Layout, Heading, CheckSquare, AlignLeft, Calendar, FileText, History } from "lucide-react";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { FieldPalette } from "@/components/builder/field-palette";
import { FieldSettings } from "@/components/builder/field-settings";
import { FieldCard, EmptySlot } from "@/components/builder/field-card";
import { useFormBuilderStore, FieldType } from "@/stores/useFormBuilderStore";
import { FloatingDock } from "@/components/ui/floating-dock";
import { VersionHistoryPanel } from "@/components/builder/version-history-panel";
import {
  IconSettings,
  IconEye,
  IconDeviceFloppy,
  IconUpload,
  IconForms,
  IconMessageCircle,
  IconTerminal2,
  IconLayoutList,
  IconDeviceMobile,
  IconCards,
  IconSlideshow,
  IconLayoutKanban,
  IconBook,
} from "@tabler/icons-react";
import { trpc } from "@/src/trpc/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Droppable Empty Slot ─────────────────────────────────────────
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
function CanvasDropZone({ previewFields }: { previewFields?: any[] }) {
  const store = useFormBuilderStore();
  const fields = previewFields || store.fields;
  const isPreviewMode = !!previewFields;
  const { setActiveField, activeElementId, removeField, duplicateField } = store;

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
    data: { type: "canvas" },
    disabled: isPreviewMode,
  });

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
        state={isPreviewMode ? "default" : (activeElementId === f.id ? "selected" : "default")}
        onClick={(e) => { e.stopPropagation(); if (!isPreviewMode) setActiveField(f.id); }}
        onDelete={isPreviewMode ? undefined : () => removeField(f.id)}
        onDuplicate={isPreviewMode ? undefined : () => duplicateField(f.id)}
      />
    );

    if (field.width === "half") {
      renderList.push(makeCard(field));
      const next = fields[fi + 1];
      if (next?.width === "half") {
        renderList.push(makeCard(next));
        fi += 2;
      } else {
        if (!isPreviewMode) renderList.push(<DroppableEmptySlot key={`slot-${field.id}`} afterFieldId={field.id} />);
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
      className={`flex-1 rounded-2xl border-2 transition-all duration-200 overflow-y-auto custom-scrollbar p-8 flex flex-col relative ${
        isOver && !isPreviewMode
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
function BuilderUI({ formId }: { formId: string }) {
  const { fields, setFields, addField, reorderFields } = useFormBuilderStore();
  const utils = trpc.useUtils();

  const { data: form, isLoading: loadingForm, isError: formError, refetch: refetchForm } = trpc.forms.getById.useQuery({ id: formId });
  const { data: versions, isLoading: loadingVersions, isError: versionsError, refetch: refetchVersions } = trpc.formVersions.getAll.useQuery({ formId });

  const [formName, setFormName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [previewingVersion, setPreviewingVersion] = useState<any>(null);

  const { mutate: updateForm } = trpc.forms.update.useMutation({
    onError: (err) => toast.error(err.message || "Failed to update form name"),
  });
  const { mutate: createVersion } = trpc.formVersions.create.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      utils.formVersions.getAll.invalidate({ formId });
    },
    onError: () => {
      setSaveStatus("idle");
      toast.error("Failed to save form");
    }
  });

  const { mutate: publishForm, isPending: isPublishing } = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published successfully!");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to publish form"),
  });

  const { mutate: saveAsTemplate, isPending: isSavingTemplate } = trpc.templates.createUserTemplate.useMutation({
    onSuccess: () => toast.success("Saved as template!"),
    onError: (err) => toast.error(err.message || "Failed to save template"),
  });

  // Load Initial Data
  useEffect(() => {
    if (form && versions && !isInitialized) {
      setFormName(form.name);
      const latestVersion = versions[0];
      if (latestVersion && latestVersion.schema && Array.isArray((latestVersion.schema as any).fields)) {
        setFields((latestVersion.schema as any).fields);
      }
      setIsInitialized(true);
    }
  }, [form, versions, isInitialized, setFields]);

  // Auto-Save
  useEffect(() => {
    if (!isInitialized) return;
    
    setSaveStatus("saving");
    const timeoutId = setTimeout(() => {
      createVersion({
        formId,
        schema: { fields }
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [fields, isInitialized, createVersion, formId]);

  const handleNameUpdate = () => {
    if (formName.trim() && formName !== form?.name) {
      updateForm({ id: formId, name: formName.trim() });
    }
  };

  const dockLinks = [
    {
      title: "Build Mode",
      icon: <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: `/forms/${formId}/builder`,
    },
    {
      title: "Preview Form",
      icon: <IconEye className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: `/f/${formId}`,
      subItems: [
        { title: "Normal Mode", href: `/f/${formId}?mode=normal`, icon: <IconLayoutList /> },
        { title: "Chat Mode", href: `/f/${formId}?mode=chat`, icon: <IconMessageCircle /> },
        { title: "Terminal Mode", href: `/f/${formId}?mode=terminal`, icon: <IconTerminal2 /> },
        { title: "One-by-One", href: `/f/${formId}?mode=one-by-one`, icon: <IconDeviceMobile /> },
        { title: "Card Swipe", href: `/f/${formId}?mode=swipe`, icon: <IconCards /> },
        { title: "Story Mode", href: `/f/${formId}?mode=story`, icon: <IconBook /> },
        { title: "Slide Mode", href: `/f/${formId}?mode=slide`, icon: <IconSlideshow /> },
      ]
    },
    {
      title: "Save Draft",
      icon: <IconDeviceFloppy className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: `#`,
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

      if (overId.startsWith("empty-slot-")) {
        const afterFieldId = over.data.current?.afterFieldId as string;
        const afterIndex = fields.findIndex((f) => f.id === afterFieldId);
        addField(fieldType, afterIndex + 1, { width: "half" });
        return;
      }

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

  if (loadingForm || loadingVersions) {
    return (
      <div className="fixed inset-0 bg-neutral-50" style={{ zIndex: 40, top: 64 }}>
        <div className="flex gap-6 h-full px-6 pt-5 pb-[100px]">
          <div className="w-[260px] shrink-0 bg-neutral-200/60 animate-pulse rounded-2xl border border-neutral-200" />
          <div className="flex-1 bg-neutral-200/60 animate-pulse rounded-2xl border border-neutral-200" />
          <div className="w-[300px] shrink-0 bg-neutral-200/60 animate-pulse rounded-2xl border border-neutral-200" />
        </div>
      </div>
    );
  }

  if (formError || versionsError) {
    return (
      <div className="fixed inset-0 bg-neutral-50 flex items-center justify-center flex-col gap-4" style={{ zIndex: 40, top: 64 }}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
          <IconForms size={32} />
        </div>
        <p className="text-neutral-700 font-semibold text-lg tracking-tight">Failed to load form builder</p>
        <button 
          onClick={() => { refetchForm(); refetchVersions(); }} 
          className="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 transition-colors rounded-xl font-medium text-sm text-neutral-700 shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
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
        <div className="flex gap-6 h-full px-6 pt-5 pb-[100px]">
          <div className="w-[260px] shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-hidden">
            <FieldPalette />
          </div>
          
          <div className="flex-1 flex flex-col gap-4 relative">
            {previewingVersion && (
              <div className="bg-neutral-800 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between text-sm px-6">
                <span className="font-semibold">👁 Previewing v{versions?.length! - versions?.findIndex(v => v.id === previewingVersion.id)!} — {new Date(previewingVersion.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPreviewingVersion(null)} className="text-neutral-300 hover:text-white transition-colors">
                    ← Back to current
                  </button>
                </div>
              </div>
            )}
            <CanvasDropZone previewFields={previewingVersion?.schema?.fields} />
          </div>

          <div className="w-[300px] shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-hidden transition-all duration-300">
            {isHistoryOpen ? (
              <VersionHistoryPanel 
                formId={formId} 
                currentVersionId={versions?.[0]?.id || ""}
                previewingVersionId={previewingVersion?.id || null}
                onClose={() => setIsHistoryOpen(false)}
                onPreview={(version) => setPreviewingVersion(version)}
                onRestoreSuccess={() => {
                  refetchVersions();
                  refetchForm();
                  setIsHistoryOpen(false);
                  setPreviewingVersion(null);
                }}
              />
            ) : (
              <FieldSettings />
            )}
          </div>
        </div>

        {/* Floating Toolbar & Actions */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
          <FloatingDock items={dockLinks}>
            <div className="flex items-center gap-3 w-48">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onBlur={handleNameUpdate}
                onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
                className="bg-transparent border-none outline-none text-sm font-bold text-neutral-700 w-full focus:ring-2 focus:ring-violet-200 rounded px-2 py-1 transition-all"
                placeholder="Form Name"
              />
            </div>
          </FloatingDock>
          
          <div className="flex items-center gap-3">
            <div className="w-16 flex justify-end">
              <span className={`text-[11px] font-medium transition-opacity duration-300 ${saveStatus === "saving" ? "text-neutral-500 opacity-100" : saveStatus === "saved" ? "text-emerald-500 opacity-100" : "opacity-0"}`}>
                {saveStatus === "saving" ? "Saving..." : "Saved \u2713"}
              </span>
            </div>

            <button 
              onClick={() => saveAsTemplate({ schema: { fields } as any, name: `${formName} Template` })}
              disabled={isSavingTemplate}
              className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-2xl shadow-lg transition-all flex items-center gap-2 border border-neutral-200 disabled:opacity-50"
            >
              {isSavingTemplate ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Save Template
            </button>

            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`px-4 py-2.5 ${isHistoryOpen ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"} text-xs font-semibold rounded-2xl shadow-lg transition-all flex items-center gap-2 border`}
            >
              <History size={16} />
              History
            </button>
            <button 
              onClick={() => publishForm({ id: formId })}
              disabled={isPublishing}
              className="px-5 py-2.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-2xl shadow-lg shadow-black/20 transition-all flex items-center gap-2 border border-black/10 disabled:opacity-50"
            >
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <IconUpload size={16} />}
              Publish
            </button>
          </div>
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

export default function FormBuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;
  return createPortal(<BuilderUI formId={formId} />, document.body);
}
