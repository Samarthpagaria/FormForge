"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { SaveTemplateModal } from "@/components/builder/SaveTemplateModal";
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
        options={f.options}
        ratingMax={f.ratingMax}
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
          ? "border-violet-400 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-900/20 shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
          : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
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
  const router = useRouter();

  const { data: form, isLoading: loadingForm, isError: formError, refetch: refetchForm } = trpc.forms.getById.useQuery({ id: formId });
  const { data: versions, isLoading: loadingVersions, isError: versionsError, refetch: refetchVersions } = trpc.formVersions.getAll.useQuery({ formId });

  const [formName, setFormName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [previewingVersion, setPreviewingVersion] = useState<any>(null);

  const { mutate: updateForm } = trpc.forms.update.useMutation({
    onError: (err) => {
      toast.error(err.message || "Failed to update form name");
      setFormName(form?.name || "");
    }
  });
  const { mutate: updateDraft } = trpc.forms.update.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
    },
    onError: () => {
      setSaveStatus("idle");
      toast.error("Failed to save draft");
    }
  });

  const { mutate: publishVersion, isPending: isPublishing } = trpc.formVersions.publishVersion.useMutation({
    onSuccess: () => {
      toast.success("Form published successfully!");
      utils.forms.getById.invalidate({ id: formId });
      utils.formVersions.getAll.invalidate({ formId });
      router.push(`/forms/${formId}/share`);
    },
    onError: (err) => toast.error(err.message || "Failed to publish form"),
  });

  const { mutate: createSnapshot, isPending: isCreatingSnapshot } = trpc.formVersions.createSnapshot.useMutation({
    onSuccess: () => {
      toast.success("Version saved to history!");
      utils.formVersions.getAll.invalidate({ formId });
    },
    onError: (err) => toast.error(err.message || "Failed to save version"),
  });

  const { mutate: saveAsTemplate, isPending: isSavingTemplate } = trpc.templates.createUserTemplate.useMutation({
    onSuccess: () => toast.success("Saved as template!"),
    onError: (err) => toast.error(err.message || "Failed to save template"),
  });

  // Load Initial Data
  const lastSavedFields = useRef<string | null>(null);

  useEffect(() => {
    if (form && versions && !isInitialized) {
      setFormName(form.name);
      
      const normalizeFields = (rawFields: any[]) => {
        return rawFields.map((f: any) => {
          let type = f.type;
          if (type === "text") type = "short_text";
          else if (type === "textarea") type = "long_text";
          else if (type === "tel") type = "phone";
          else if (type === "select") type = "dropdown";

          return {
            ...f,
            id: f.id || `field-${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            width: f.width || "full",
          };
        });
      };

      let loadedFields = [];
      if (form.draftSchema && Array.isArray((form.draftSchema as any).fields) && (form.draftSchema as any).fields.length > 0) {
        loadedFields = normalizeFields((form.draftSchema as any).fields);
      } else {
        const latestVersion = versions[0];
        if (latestVersion && latestVersion.schema && Array.isArray((latestVersion.schema as any).fields)) {
          loadedFields = normalizeFields((latestVersion.schema as any).fields);
        }
      }
      
      setFields(loadedFields);
      lastSavedFields.current = JSON.stringify(loadedFields);
      setIsInitialized(true);
    }
  }, [form, versions, isInitialized, setFields]);

  // Auto-Save
  useEffect(() => {
    if (!isInitialized || lastSavedFields.current === null) return;
    
    const currentFieldsStr = JSON.stringify(fields);
    if (currentFieldsStr === lastSavedFields.current) return;
    
    setSaveStatus("saving");
    const timeoutId = setTimeout(() => {
      updateDraft({
        id: formId,
        draftSchema: { fields }
      });
      lastSavedFields.current = currentFieldsStr;
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [fields, isInitialized, updateDraft, formId]);

  const handleNameUpdate = () => {
    if (formName.trim() && formName !== form?.name) {
      updateForm({ id: formId, name: formName.trim() });
    }
  };



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
    <div className="fixed inset-0 bg-neutral-50 dark:bg-zinc-950" style={{ zIndex: 40, top: 64 }}>
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
          <div className="w-[260px] shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm shadow-neutral-200/40 dark:shadow-none flex flex-col overflow-hidden">
            <FieldPalette />
          </div>
          
          <div className="flex-1 flex flex-col gap-4 relative pt-2">
            <div className="absolute top-0 right-4 z-10 pointer-events-none">
              <span className="bg-white/90 backdrop-blur-sm shadow-sm text-neutral-500 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border border-neutral-200">
                {previewingVersion ? `Preview v${previewingVersion.version}` : (versions && versions.length > 0 && versions[0]) ? `Draft (v${Number(versions[0].version) + 1})` : 'Draft'}
              </span>
            </div>
            {previewingVersion && (
              <div className="bg-neutral-800 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between text-sm px-6">
                <span className="font-semibold">👁 Previewing v{versions ? versions.length - versions.findIndex(v => v.id === previewingVersion.id) : 1} — {previewingVersion.createdAt ? new Date(previewingVersion.createdAt).toLocaleString() : ""}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPreviewingVersion(null)} className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">
                    ← Back to current
                  </button>
                </div>
              </div>
            )}
            <CanvasDropZone previewFields={previewingVersion?.schema?.fields} />
          </div>

          <div className="w-[300px] shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm shadow-neutral-200/40 dark:shadow-none flex flex-col overflow-hidden transition-all duration-300">
            {isHistoryOpen ? (
              <VersionHistoryPanel 
                formId={formId} 
                currentVersionId={form?.currentVersionId || ""}
                previewingVersionId={previewingVersion?.id || null}
                onClose={() => setIsHistoryOpen(false)}
                onPreview={(version) => setPreviewingVersion(version)}
                onRestoreSuccess={() => {
                  window.location.reload();
                }}
              />
            ) : (
              <FieldSettings />
            )}
          </div>
        </div>

        {/* Floating Toolbar & Actions */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-xl shadow-black/10 dark:shadow-black/40 rounded-full p-2 h-16">
          {/* Name */}
          <div className="flex items-center px-4 border-r border-neutral-200 dark:border-zinc-800 h-full">
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
              className="bg-transparent border-none outline-none text-sm font-semibold text-neutral-800 dark:text-zinc-100 min-w-[200px] max-w-[400px] focus:ring-0 placeholder-neutral-400 dark:placeholder-zinc-600"
              placeholder="Form Name"
            />
          </div>

          {/* Current Options */}
          <div className="relative group flex items-center">
            <a href={form?.slug ? `/f/${form.slug}?draft=true` : "#"} target="_blank" title="Preview your current draft in a new tab" className="px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full flex items-center gap-2 text-neutral-600 dark:text-zinc-300 transition-colors">
              <IconEye size={18} /> Preview
            </a>
            {/* Main Dropdown */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl w-48 z-50">
              
              {/* Draft Menu Item (Nested) */}
              <div className="relative group/draft">
                <div className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 border-b border-neutral-100 flex items-center justify-between cursor-default transition-colors rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Draft Preview
                  </div>
                  <ChevronRight size={14} className="text-neutral-400" />
                </div>
                
                {/* Nested Draft Layouts */}
                <div className="absolute bottom-0 right-full mr-2 opacity-0 invisible group-hover/draft:opacity-100 group-hover/draft:visible transition-all duration-200 flex flex-col bg-white border border-neutral-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden w-48 z-50">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-50/80 border-b border-neutral-100">
                    Layout Modes
                  </div>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=normal` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconLayoutList size={16} className="text-violet-500" /> Standard
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=story` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconBook size={16} className="text-blue-500" /> Story Mode
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=swipe` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconCards size={16} className="text-amber-500" /> Card Mode
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=one-by-one` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconForms size={16} className="text-orange-500" /> One-by-One
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=slide` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconSlideshow size={16} className="text-indigo-500" /> Slide Mode
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=terminal` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconTerminal2 size={16} className="text-emerald-500" /> Terminal
                  </a>
                  <a href={form?.slug ? `/f/${form.slug}?draft=true&mode=chat` : "#"} target="_blank" className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors">
                    <IconMessageCircle size={16} className="text-pink-500" /> Chat Mode
                  </a>
                </div>
              </div>

              <a href={form?.slug ? `/f/${form.slug}` : "#"} target="_blank" className="px-4 py-3 text-sm font-bold text-neutral-900 hover:bg-neutral-50 flex items-center gap-2 transition-colors rounded-b-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Live Published
              </a>
            </div>
          </div>

          <div className="w-px h-8 bg-neutral-200 dark:bg-zinc-800 mx-1" />

          {/* Actions */}
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`px-4 py-2 ${isHistoryOpen ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" : "hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-zinc-300"} text-sm font-medium rounded-full transition-colors flex items-center gap-2`}
          >
            <History size={18} /> History
          </button>

          <button 
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-sm font-medium rounded-full transition-colors flex items-center gap-2"
            title="Save as reusable dashboard template"
          >
            <FileText size={18} />
            Save as Template
          </button>

          <button
            onClick={() => createSnapshot({ formId })}
            disabled={isCreatingSnapshot}
            className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-sm font-medium rounded-full transition-colors flex items-center gap-2"
            title="Save to history but keep private"
          >
            {isCreatingSnapshot ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Version
          </button>

          <button 
            onClick={() => publishVersion({ formId })}
            disabled={isPublishing}
            className="px-6 py-2 bg-[#18181b] dark:bg-zinc-100 hover:bg-[#27272a] dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-medium rounded-full shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ml-1"
            title="Push changes live to public"
          >
            {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Publish
          </button>
        </div>

        <SaveTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          defaultName={formName.endsWith("Template") ? formName : `${formName} Template`}
          isSaving={isSavingTemplate}
          onSave={(name, categoryId) => {
            saveAsTemplate({ schema: { fields } as any, name, categoryId });
            setIsTemplateModalOpen(false);
          }}
        />

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
