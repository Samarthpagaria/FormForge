// apps/web/components/form-renderer/modes/fieldHelpers.ts

import React from "react";
import { FormField } from "../schema";
import { Check } from "lucide-react";

/**
 * Render a form field based on its type.
 * Supports all primitive input types, options, rating, hidden, and textarea.
 *
 * @param field The current FormField (can be null)
 * @param values Current form values object
 * @param handleChange Engine handler to update a field value
 * @param setFieldError Setter to clear validation errors
 */
export function renderField(
  field: FormField | null,
  values: Record<string, any>,
  handleChange: (id: string, value: any) => void,
  setFieldError: (msg: string | null) => void
) {
  if (!field) return null;

  // Simple input types (including newly added ones and short_text)
  const simpleTypes = new Set([
    "short_text",
    "text",
    "email",
    "number",
    "phone",
    "date",
    "file",
    "password",
    "url",
    "tel",
    "color",
    "range",
  ]);
  if (simpleTypes.has(field.type)) {
    return (
      <input
        autoFocus
        type={
          field.type === "email"
            ? "email"
            : field.type === "number"
            ? "number"
            : field.type === "date"
            ? "date"
            : field.type === "file"
            ? "file"
            : field.type === "password"
            ? "password"
            : field.type === "url"
            ? "url"
            : field.type === "tel"
            ? "tel"
            : field.type === "color"
            ? "color"
            : field.type === "range"
            ? "range"
            : "text"
        }
        value={
          values[field.id] || (field.type === "range" ? 0 : "")
        }
        onChange={e => {
          const val =
            e.target.type === "range"
              ? Number(e.target.value)
              : e.target.value;
          handleChange(field.id, val);
          setFieldError(null);
        }}
        placeholder="Type your answer..."
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-2xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner"
      />
    );
  }

  // Hidden fields are stored but not rendered
  if (field.type === "hidden") {
    if (!(field.id in values)) {
      handleChange(field.id, "");
    }
    return null;
  }

  // Textarea
  if (field.type === "textarea") {
    return (
      <textarea
        autoFocus
        value={values[field.id] || ""}
        onChange={e => {
          handleChange(field.id, e.target.value);
          setFieldError(null);
        }}
        placeholder="Type your answer..."
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner min-h-[160px] resize-none"
      />
    );
  }

  // Options (select, radio, checkbox) – rendered as a grid of buttons
  if (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field.options?.map(opt => {
          const isMulti = field.type === "checkbox";
          const valArray = (values[field.id] as string[]) || [];
          const isSelected = isMulti
            ? valArray.includes(opt)
            : values[field.id] === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                if (isMulti) {
                  handleChange(
                    field.id,
                    isSelected
                      ? valArray.filter(v => v !== opt)
                      : [...valArray, opt]
                  );
                } else {
                  handleChange(field.id, opt);
                }
                setFieldError(null);
              }}
              className={`flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  isSelected ? "bg-blue-500 border-blue-500" : "border-slate-500"
                }`}
              >
                {isSelected && <Check size={16} className="text-white" />}
              </div>
              <span
                className={`text-xl ${
                  isSelected ? "text-white font-medium" : "text-slate-300"
                }`}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Rating
  if (field.type === "rating") {
    return (
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map(r => (
          <button
            key={r}
            onClick={() => {
              handleChange(field.id, r);
              setFieldError(null);
            }}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl transition-all ${
              values[field.id] === r
                ? "bg-amber-500/20 border-amber-500 text-amber-400 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  // Fallback – currently unsupported types
  return null;
}
