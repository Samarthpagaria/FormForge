import React from "react";
import {
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  CheckSquare,
  ListRestart, // Using ListRestart for radio/group
  ChevronDownSquare,
  Calendar,
  Star,
  UploadCloud,
  GripVertical
} from "lucide-react";

import { useDraggable } from "@dnd-kit/core";

export type FieldItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export type FieldSection = {
  title: string;
  fields: FieldItem[];
};

const FIELD_SECTIONS: FieldSection[] = [
  {
    title: "Basic Fields",
    fields: [
      { id: "short_text", label: "Short Text", icon: Type },
      { id: "email", label: "Email", icon: Mail },
      { id: "phone", label: "Phone", icon: Phone },
      { id: "number", label: "Number", icon: Hash },
      { id: "long_text", label: "Long Text", icon: AlignLeft },
    ],
  },
  {
    title: "Choice Fields",
    fields: [
      { id: "checkbox", label: "Checkbox", icon: CheckSquare },
      { id: "radio", label: "Radio Group", icon: ListRestart },
      { id: "dropdown", label: "Dropdown", icon: ChevronDownSquare },
    ],
  },
  {
    title: "Advanced",
    fields: [
      { id: "date", label: "Date", icon: Calendar },
      { id: "rating", label: "Rating", icon: Star },
    ],
  },
];

export function FieldDraggable({ field }: { field: FieldItem }) {
  const Icon = field.icon;
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.id}`,
    data: {
      type: "palette-item",
      fieldType: field.id,
      label: field.label,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: 'none' }}
      className={`group flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab hover:bg-neutral-100 transition-all duration-200 ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Visual drag handle */}
      <div className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={14} className="stroke-[2]" />
      </div>
      <div className="flex items-center gap-2.5 flex-1">
        <Icon size={16} className="text-neutral-500 stroke-[1.5]" />
        <span className="text-sm font-medium text-neutral-800">
          {field.label}
        </span>
      </div>
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="w-full flex-shrink-0 bg-white flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Header / Search placeholder */}
      <div className="p-4 pb-2 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-bold tracking-tight text-neutral-900 mb-3">
          Fields
        </h2>
        <input
          type="text"
          placeholder="Search fields..."
          className="w-full text-xs bg-white/60 border border-neutral-200/80 rounded-md px-3 py-2 outline-none focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-neutral-400"
        />
      </div>

      {/* Field Sections */}
      <div className="flex flex-col px-3 py-2">
        {FIELD_SECTIONS.map((section, idx) => (
          <React.Fragment key={section.title}>
            <div className="py-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 px-2">
                {section.title}
              </h3>
              <div className="flex flex-col space-y-0.5">
                {section.fields.map((field) => (
                  <FieldDraggable key={field.id} field={field} />
                ))}
              </div>
            </div>
            {/* Divider */}
            {idx < FIELD_SECTIONS.length - 1 && (
              <div className="h-px bg-neutral-200/60 mx-2 my-1" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
