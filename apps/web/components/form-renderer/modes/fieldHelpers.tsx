// apps/web/components/form-renderer/modes/fieldHelpers.tsx
// Shared field renderer used by Slide, Terminal, and Chat modes.

import React from "react";
import { FormField } from "../schema";
import { Check } from "lucide-react";

/**
 * Render a form field based on its type.
 * Styled for dark-background modes (Slide, Terminal).
 */
export function renderField(
  field: FormField | null | undefined,
  values: Record<string, any>,
  handleChange: (id: string, value: any) => void,
  setFieldError: (msg: string | null) => void
) {
  if (!field) return null;

  // ── Simple text inputs ────────────────────────────────────────────────────
  const simpleTypes = new Set([
    "text", "short_text", "name",
    "email", "number", "phone",
    "date", "file", "password",
    "url", "tel", "color", "range",
  ]);

  if (simpleTypes.has(field.type)) {
    return (
      <input
        autoFocus
        type={
          field.type === "email"    ? "email"  :
          field.type === "number"   ? "number" :
          field.type === "date"     ? "date"   :
          field.type === "file"     ? "file"   :
          field.type === "password" ? "password" :
          field.type === "url"      ? "url"    :
          field.type === "tel"      ? "tel"    :
          field.type === "color"    ? "color"  :
          field.type === "range"    ? "range"  :
          "text"
        }
        value={values[field.id] || (field.type === "range" ? 0 : "")}
        onChange={e => {
          const val = e.target.type === "range" ? Number(e.target.value) : e.target.value;
          handleChange(field.id, val);
          setFieldError(null);
        }}
        placeholder={field.placeholder || "Type your answer..."}
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-2xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner"
      />
    );
  }

  // ── Hidden ────────────────────────────────────────────────────────────────
  if (field.type === "hidden") {
    if (!(field.id in values)) handleChange(field.id, "");
    return null;
  }

  // ── Textarea / Long text ──────────────────────────────────────────────────
  if (field.type === "textarea" || field.type === "long_text") {
    return (
      <textarea
        autoFocus
        value={values[field.id] || ""}
        onChange={e => { handleChange(field.id, e.target.value); setFieldError(null); }}
        placeholder={field.placeholder || "Type your answer..."}
        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner min-h-[160px] resize-none"
      />
    );
  }

  // ── Options: select / radio / checkbox / dropdown ─────────────────────────
  if (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown") {
    const isMulti  = field.type === "checkbox";
    const valArray = (values[field.id] as string[]) || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field.options?.map(opt => {
          const isSelected = isMulti ? valArray.includes(opt) : values[field.id] === opt;
          return (
            <button key={opt}
              onClick={() => {
                if (isMulti) {
                  handleChange(field.id, isSelected ? valArray.filter(v => v !== opt) : [...valArray, opt]);
                } else {
                  handleChange(field.id, opt);
                }
                setFieldError(null);
              }}
              className={`flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }`}>
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                isSelected ? "bg-blue-500 border-blue-500" : "border-slate-500"
              }`}>
                {isSelected && <Check size={16} className="text-white" />}
              </div>
              <span className={`text-xl ${isSelected ? "text-white font-medium" : "text-slate-300"}`}>{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  if (field.type === "rating") {
    const rating = typeof values[field.id] === "number" ? values[field.id] : 0;
    return (
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map(r => (
          <button key={r}
            onClick={() => { handleChange(field.id, r); setFieldError(null); }}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl transition-all ${
              r <= rating
                ? "bg-amber-500/20 border-amber-500 text-amber-400 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-amber-300"
            }`}>
            ★
          </button>
        ))}
      </div>
    );
  }

  return null;
}
