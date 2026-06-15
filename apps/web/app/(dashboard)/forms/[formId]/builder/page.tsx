"use client";

import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { FieldPalette } from "@/components/builder/field-palette";
import { FieldSettings } from "@/components/builder/field-settings";
import { FieldCard, EmptySlot } from "@/components/builder/field-card";
import { useFormBuilderStore, FieldType } from "@/stores/useFormBuilderStore";

export default function FormBuilderPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { fields, addField, reorderFields, setActiveField, activeElementId } = useFormBuilderStore();
  
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<"palette" | "canvas" | null>(null);
  const [activeDragFieldType, setActiveDragFieldType] = useState<FieldType | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isPalette = active.data.current?.type === "palette-item";
    setActiveDragId(active.id as string);
    setActiveDragType(isPalette ? "palette" : "canvas");
    if (isPalette) {
      setActiveDragFieldType(active.data.current?.fieldType as FieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDragId(null);
    setActiveDragType(null);
    setActiveDragFieldType(null);

    if (!over) return;

    const isPaletteDrop = active.data.current?.type === "palette-item";

    if (isPaletteDrop) {
      // Add new field from palette
      const fieldType = active.data.current?.fieldType as FieldType;
      
      let dropIndex = fields.length;
      if (over.id !== "canvas-drop-zone") {
        dropIndex = fields.findIndex((f) => f.id === over.id);
        if (dropIndex === -1) dropIndex = fields.length;
      }
      
      addField(fieldType, dropIndex);
    } else {
      // Reordering existing fields
      if (active.id !== over.id && over.id !== "canvas-drop-zone") {
        reorderFields(active.id as string, over.id as string);
      }
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
  };

  let hasHangingHalf = false;
  fields.forEach(f => {
    if (f.width === 'half') {
      hasHangingHalf = !hasHangingHalf;
    } else {
      hasHangingHalf = false;
    }
  });

  // Hydration safety
  if (!isMounted) {
    return null;
  }

  return (
    <DndContext
      id="form-builder-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="-mt-4 flex flex-1 gap-6 items-center w-full" style={{ height: "calc(100vh - 100px)" }}>
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
            backgroundRepeat: "repeat",
          }}
        />

        {/* 1. Left Panel (Field Palette) */}
        <div className="w-[260px] h-full max-h-[85vh] bg-white rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 shrink-0 z-10 flex flex-col overflow-hidden">
          <FieldPalette />
        </div>

        {/* 2. Center Canvas */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-[896px] bg-white min-h-[700px] rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 p-8 flex flex-col my-auto">
            <SortableContext 
              items={fields.map(f => f.id)} 
              strategy={rectSortingStrategy}
            >
              <div 
                className="grid grid-cols-12 gap-4 w-full min-h-[200px]"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setActiveField(null);
                  }
                }}
              >
                {fields.length === 0 ? (
                  <div className="col-span-12 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                    <p className="text-sm font-medium text-neutral-600">Drag a field here to get started</p>
                    <p className="text-xs text-neutral-400 mt-1">Select from the basic or advanced fields on the left.</p>
                  </div>
                ) : (
                  fields.map((field) => (
                    <FieldCard
                      key={field.id}
                      id={field.id}
                      type={field.type}
                      label={field.label}
                      placeholder={field.placeholder}
                      helpText={field.helpText}
                      required={field.required}
                      width={field.width}
                      state={activeElementId === field.id ? "selected" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveField(field.id);
                      }}
                    />
                  ))
                )}

                {hasHangingHalf && (
                  <EmptySlot />
                )}
              </div>
            </SortableContext>
            
            {fields.length > 0 && (
              <div className="mt-8 flex items-center justify-center">
                <button className="px-4 py-2 text-xs font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-700 rounded-lg transition-colors border border-neutral-200 border-dashed">
                  + Add Section
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Right Panel (Field Settings) */}
        <div className="w-[320px] h-full max-h-[85vh] bg-white rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 shrink-0 z-10 flex flex-col overflow-hidden">
          <FieldSettings />
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeDragId ? (
          activeDragType === "palette" ? (
            <div className="w-[240px] opacity-80 rotate-2 scale-105">
              <FieldCard 
                type={activeDragFieldType!} 
                label={`New ${activeDragFieldType}`} 
                state="dragging" 
              />
            </div>
          ) : (
            <div className="opacity-80 rotate-2 scale-105 w-[600px]">
              {(() => {
                const f = fields.find((f) => f.id === activeDragId);
                if (!f) return null;
                return (
                  <FieldCard
                    type={f.type}
                    label={f.label}
                    placeholder={f.placeholder}
                    helpText={f.helpText}
                    required={f.required}
                    width={f.width}
                    state="dragging"
                  />
                );
              })()}
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
