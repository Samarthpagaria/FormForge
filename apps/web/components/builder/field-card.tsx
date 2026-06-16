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
  options?: string[];
  ratingMax?: number;
  state?: "default" | "selected" | "dragging";
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function FieldCard({
  id,
  type,
  label,
  placeholder = "Placeholder...",
  helpText,
  required = false,
  width = "full",
  options,
  ratingMax = 5,
  state = "default",
  onClick,
  onDelete,
  onDuplicate,
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
  const displayOptions = options?.length ? options : ["Option 1", "Option 2", "Option 3"];

  return (
    <div
      ref={id ? setNodeRef : undefined}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col p-4 min-h-[80px] bg-white rounded-xl transition-all duration-200 cursor-pointer",
        width === "half" ? "col-span-6" : "col-span-12",
        isSelected
          ? "border border-violet-300 shadow-md ring-2 ring-violet-100"
          : "border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-neutral-300",
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
            onClick={(e) => e.stopPropagation()}
            className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-neutral-500"
          >
            <GripVertical size={16} />
          </div>
          {/* Label */}
          <span className="text-sm font-semibold text-neutral-800">{label}</span>
          {required && (
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Required
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            title="Duplicate field"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete field"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Field Preview */}
      <div className="mb-1 pointer-events-none">
        {(type === "short_text" || type === "email" || type === "phone" || type === "number") && (
          <div className="w-full h-10 px-3 py-2 bg-white border border-neutral-200 rounded-lg flex items-center text-sm text-neutral-400">
            {placeholder}
          </div>
        )}

        {type === "long_text" && (
          <div className="w-full h-20 px-3 py-2 bg-white border border-neutral-200 rounded-lg flex items-start text-sm text-neutral-400">
            {placeholder}
          </div>
        )}

        {type === "dropdown" && (
          <div className="w-full h-10 px-3 py-2 bg-white border border-neutral-200 rounded-lg flex items-center justify-between text-sm text-neutral-400">
            <span>Choose an option</span>
            <ChevronDown size={16} />
          </div>
        )}

        {type === "radio" && (
          <div className="flex flex-col gap-1.5">
            {displayOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex items-center justify-center">
                  {i === 0 && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                </div>
                {opt}
              </div>
            ))}
          </div>
        )}

        {type === "checkbox" && (
          <div className="flex flex-col gap-1.5">
            {displayOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                <div className={cn("w-4 h-4 rounded border flex items-center justify-center", i === 0 ? "bg-violet-600 border-violet-600 text-white" : "border-neutral-300")}>
                  {i === 0 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {opt}
              </div>
            ))}
          </div>
        )}

        {type === "date" && (
          <div className="w-full h-10 px-3 py-2 bg-white border border-neutral-200 rounded-lg flex items-center justify-between text-sm text-neutral-400">
            <span>MM / DD / YYYY</span>
            <Calendar size={16} />
          </div>
        )}

        {type === "file" && (
          <div className="w-full h-20 bg-neutral-100/60 border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-sm text-neutral-500">
            <UploadCloud size={18} className="text-neutral-400" />
            <span>Click or drag to upload</span>
          </div>
        )}

        {type === "rating" && (
          <div className="flex items-center gap-1">
            {Array.from({ length: ratingMax }).map((_, i) => (
              <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill={i === 0 ? "#f59e0b" : "currentColor"} className={i === 0 ? "text-amber-400" : "text-neutral-200"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && (
        <div className="text-[11px] text-neutral-400 mt-1">{helpText}</div>
      )}
    </div>
  );
}

export function EmptySlot() {
  return (
    <div className="col-span-6 min-h-[100px] rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 flex flex-col items-center justify-center gap-2 select-none group">
      <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <p className="text-[11px] font-semibold text-neutral-400 tracking-wide uppercase">Half-width slot</p>
    </div>
  );
}
