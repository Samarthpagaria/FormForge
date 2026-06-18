"use client";
import React, { useState } from "react";
import { Type, Trash2, Copy, Settings2, List, Columns, Plus, X, Star } from "lucide-react";
import { useFormBuilderStore } from "@/stores/useFormBuilderStore";

export function FieldSettings() {
  const { fields, activeElementId, setActiveField, updateFieldProps, removeField, duplicateField } = useFormBuilderStore();
  const activeField = fields.find((f) => f.id === activeElementId);

  if (!activeField) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-zinc-500">
        <div className="w-12 h-12 bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-100 dark:border-zinc-800 rounded-full flex items-center justify-center mb-3">
          <Settings2 size={20} className="text-neutral-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-zinc-400">No field selected</p>
        <p className="text-xs mt-1">Click a field on the canvas to edit it</p>
      </div>
    );
  }

  const isChoiceField = ["dropdown", "radio", "checkbox"].includes(activeField.type);
  const isNumberField = activeField.type === "number";
  const isRatingField = activeField.type === "rating";
  const isFileField = activeField.type === "file";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Header ── */}
      <div className="p-4 border-b border-neutral-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-neutral-100 dark:bg-zinc-800 rounded flex items-center justify-center text-neutral-800 dark:text-zinc-200">
            <Type size={13} strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 capitalize">
            {activeField.type.replace(/_/g, " ")}
          </h2>
        </div>
        <button
          onClick={() => setActiveField(null)}
          className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Deselect
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5 flex-1">

        {/* ── Basic Settings ── */}
        <section className="flex flex-col gap-3">
          <SettingsInput
            label="Label"
            value={activeField.label}
            onChange={(v) => updateFieldProps(activeField.id, { label: v })}
          />

          {!isChoiceField && !isRatingField && !isFileField && (
            <SettingsInput
              label="Placeholder"
              value={activeField.placeholder || ""}
              onChange={(v) => updateFieldProps(activeField.id, { placeholder: v })}
            />
          )}

          <SettingsInput
            label="Help Text"
            value={activeField.helpText || ""}
            placeholder="Add description or instructions..."
            onChange={(v) => updateFieldProps(activeField.id, { helpText: v })}
          />

          {/* Required toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-zinc-100">Required</p>
              <p className="text-[11px] text-neutral-400 dark:text-zinc-500">Must be filled before submit</p>
            </div>
            <div
              role="switch"
              aria-checked={activeField.required}
              onClick={() => updateFieldProps(activeField.id, { required: !activeField.required })}
              className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${activeField.required ? "bg-violet-600 dark:bg-violet-500" : "bg-neutral-200 dark:bg-zinc-700"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeField.required ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>

          {/* Width toggle */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-neutral-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-zinc-100">Half Width</p>
              <p className="text-[11px] text-neutral-400 dark:text-zinc-500">Shows fields side-by-side</p>
              <p className="text-[9px] text-amber-500 font-medium mt-0.5">*Standard Mode only</p>
            </div>
            <div
              role="switch"
              aria-checked={activeField.width === "half"}
              onClick={() => updateFieldProps(activeField.id, { width: activeField.width === "half" ? "full" : "half" })}
              className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${activeField.width === "half" ? "bg-violet-600 dark:bg-violet-500" : "bg-neutral-200 dark:bg-zinc-700"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeField.width === "half" ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Choice Field Options ── */}
        {isChoiceField && (
          <OptionsEditor
            options={activeField.options || []}
            onChange={(opts) => updateFieldProps(activeField.id, { options: opts })}
          />
        )}

        {/* ── Number Field ── */}
        {isNumberField && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-zinc-500">Validation</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-zinc-100 mb-1.5">Min Value</label>
                <input
                  type="number"
                  value={activeField.minValue ?? ""}
                  onChange={(e) => updateFieldProps(activeField.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="No min"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-zinc-100 mb-1.5">Max Value</label>
                <input
                  type="number"
                  value={activeField.maxValue ?? ""}
                  onChange={(e) => updateFieldProps(activeField.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="No max"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Rating Field ── */}
        {isRatingField && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-zinc-500 flex items-center gap-1.5">
              <Star size={13} /> Rating Scale
            </h3>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-zinc-100 mb-2">Max Stars</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateFieldProps(activeField.id, { ratingMax: n })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      (activeField.ratingMax ?? 5) === n
                        ? "bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:border-violet-500"
                        : "bg-white dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 border-neutral-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {/* Preview */}
              <div className="flex items-center gap-1 mt-3">
                {Array.from({ length: activeField.ratingMax ?? 5 }).map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i === 0 ? "#f59e0b" : "currentColor"} className={i === 0 ? "text-amber-400" : "text-neutral-200 dark:text-zinc-700"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── File Field ── */}
        {isFileField && (
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-zinc-500">File Settings</h3>
            <SettingsInput
              label="Accepted File Types"
              value={activeField.acceptedFiles || ""}
              placeholder=".pdf, .png, .jpg"
              onChange={(v) => updateFieldProps(activeField.id, { acceptedFiles: v })}
            />
            <p className="text-[11px] text-neutral-400 dark:text-zinc-500">
              ⚠️ File upload storage is not yet configured on the backend. Files will not be saved until a storage provider (S3, Cloudflare R2, etc.) is integrated.
            </p>
          </section>
        )}

        <Divider />

        {/* ── Appearance ── */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-zinc-500 flex items-center gap-1.5">
            <Columns size={13} /> Width
          </h3>
          <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-zinc-800 rounded-lg">
            <button
              onClick={() => updateFieldProps(activeField.id, { width: "full" })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeField.width === "full" ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-zinc-100 shadow-sm" : "text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200"}`}
            >
              Full Width
            </button>
            <button
              onClick={() => updateFieldProps(activeField.id, { width: "half" })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeField.width === "half" ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-zinc-100 shadow-sm" : "text-neutral-500 dark:text-zinc-400 hover:text-neutral-700 dark:hover:text-zinc-200"}`}
            >
              Half Width
            </button>
          </div>
        </section>



      </div>

      {/* ── Bottom Actions ── */}
      <div className="p-4 border-t border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900 flex flex-col gap-2 mt-auto">
        <button
          onClick={() => duplicateField(activeField.id)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-700 shadow-sm transition-colors"
        >
          <Copy size={14} /> Duplicate Field
        </button>
        <button
          onClick={() => removeField(activeField.id)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-900/80 shadow-sm transition-colors"
        >
          <Trash2 size={14} /> Delete Field
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

const inputClass = "w-full text-sm text-neutral-900 dark:text-zinc-100 placeholder-neutral-300 dark:placeholder-zinc-600 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all shadow-sm";

function SettingsInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-800 dark:text-zinc-100 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-neutral-100 dark:bg-zinc-800 w-full" />;
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      onChange([...options, trimmed]);
      setNewOption("");
    }
  };

  const removeOption = (i: number) => {
    onChange(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    onChange(updated);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-zinc-500 flex items-center gap-1.5">
        <List size={13} /> Options
      </h3>
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className="flex-1 text-sm text-neutral-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all shadow-sm"
            />
            <button
              onClick={() => removeOption(i)}
              className="p-1 text-neutral-300 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
          placeholder="New option..."
          className="flex-1 text-sm text-neutral-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 outline-none focus:border-violet-400 transition-all placeholder:text-neutral-300 dark:placeholder:text-zinc-500 shadow-sm"
        />
        <button
          onClick={addOption}
          className="p-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </section>
  );
}
