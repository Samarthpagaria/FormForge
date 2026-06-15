import React from "react";
import { GripVertical, Copy, X, Calendar, UploadCloud, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type FieldType = "short_text" | "long_text" | "email" | "phone" | "number" | "dropdown" | "radio" | "checkbox" | "date" | "file" | "rating";

interface FieldCardProps {
  id?: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  width?: "full" | "half";
  state?: "default" | "selected" | "dragging";
  onClick?: (e: React.MouseEvent) => void;
}

export function FieldCard({
  id,
  type,
  label,
  placeholder = "Placeholder...",
  helpText,
  required = false,
  width = "full",
  state = "default",
  onClick,
}: FieldCardProps) {
  
  const isSelected = state === "selected";
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: id || "temp-id",
    data: { type: "field-card", fieldId: id },
    disabled: !id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDragging = state === "dragging" || isSortableDragging;

  return (
    <div
      ref={id ? setNodeRef : undefined}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col p-4 min-h-[80px] bg-white rounded-xl transition-all duration-200",
        width === "half" ? "col-span-6" : "col-span-12",
        isSelected 
          ? "border-l-4 border-l-violet-600 border-y border-r border-neutral-200 shadow-md bg-violet-50/30" 
          : "border border-neutral-200/80 shadow-sm hover:shadow-md",
        isDragging && "opacity-60 shadow-lg scale-[1.01] cursor-grabbing relative z-50"
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-neutral-500"
          >
            <GripVertical size={16} />
          </div>
          {/* Label */}
          <span className="text-sm font-semibold text-neutral-800 outline-none">
            {label}
          </span>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
            <Copy size={14} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Field Preview */}
      <div className="mb-2 pointer-events-none">
        {(type === "short_text" || type === "email" || type === "phone" || type === "number") && (
          <div className="w-full h-10 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center text-sm text-neutral-400">
            {placeholder}
          </div>
        )}

        {type === "long_text" && (
          <div className="w-full h-20 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start text-sm text-neutral-400">
            {placeholder}
          </div>
        )}

        {type === "dropdown" && (
          <div className="w-full h-10 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-sm text-neutral-400">
            <span>Choose an option</span>
            <ChevronDown size={16} />
          </div>
        )}

        {type === "radio" && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex items-center justify-center">
                  {i === 1 && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                </div>
                Option {i}
              </div>
            ))}
          </div>
        )}

        {type === "checkbox" && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                <div className={cn("w-4 h-4 rounded border flex items-center justify-center", i === 1 ? "bg-violet-600 border-violet-600 text-white" : "border-neutral-300")}>
                  {i === 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                Option {i}
              </div>
            ))}
          </div>
        )}

        {type === "date" && (
          <div className="w-full h-10 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-sm text-neutral-400">
            <span>MM / DD / YYYY</span>
            <Calendar size={16} />
          </div>
        )}

        {type === "file" && (
          <div className="w-full h-24 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-neutral-500">
            <UploadCloud size={20} className="text-neutral-400" />
            Click or drag to upload
          </div>
        )}

        {type === "rating" && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-300">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      {(helpText || required) && (
        <div className="flex items-center justify-between mt-1">
          <div className="text-[11px] text-neutral-400">{helpText}</div>
          {required && (
            <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-1.5 py-0.5 rounded">
              * Required
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EmptySlot() {
  return (
    <div className="col-span-6 min-h-[80px] bg-neutral-50/50 border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-sm font-medium text-neutral-400 hover:bg-neutral-50 hover:border-violet-300 transition-colors cursor-pointer">
      + Drop field here
    </div>
  );
}
