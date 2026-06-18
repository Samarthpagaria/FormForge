import React from "react";
import { FormField } from "./schema";
import { Star } from "lucide-react";

interface FieldProps {
  field: FormField;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
  error?: string;
}

export function FieldText({ field, disabled, value, onChange, error }: FieldProps) {
  const inputType =
    field.type === "short_text" || field.type === "text"
      ? "text"
      : field.type === "email"
      ? "email"
      : field.type === "phone"
      ? "tel"
      : field.type === "number"
      ? "number"
      : field.type === "date"
      ? "date"
      : field.type === "file"
      ? "file"
      : "text";
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type={inputType}
        placeholder={field.placeholder}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${error ? "border-red-500 focus:border-red-500" : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"}`}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}


export function FieldTextarea({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <textarea
        placeholder={field.placeholder}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        rows={4}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed resize-y ${error ? "border-red-500 focus:border-red-500" : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"}`}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

export function FieldRadioGroup({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {field.options?.map((opt, i) => (
        <label key={i} className={`flex items-center gap-2 text-sm text-neutral-700 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
          <input
            type="radio"
            name={field.id}
            value={opt}
            disabled={disabled}
            checked={value === opt}
            onChange={() => onChange?.(opt)}
            className="w-4 h-4 text-violet-600 border-neutral-300 focus:ring-violet-500/20"
          />
          {opt}
        </label>
      ))}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

export function FieldCheckboxGroup({ field, disabled, value, onChange, error }: FieldProps) {
  const selected = Array.isArray(value) ? value : [];
  
  const handleToggle = (opt: string) => {
    if (disabled) return;
    if (selected.includes(opt)) {
      onChange?.(selected.filter(o => o !== opt));
    } else {
      onChange?.([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {field.options?.map((opt, i) => (
        <label key={i} className={`flex items-center gap-2 text-sm text-neutral-700 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={selected.includes(opt)}
            onChange={() => handleToggle(opt)}
            className="w-4 h-4 text-violet-600 border-neutral-300 rounded focus:ring-violet-500/20"
          />
          {opt}
        </label>
      ))}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

export function FieldRating({ field, disabled, value, onChange, error }: FieldProps) {
  const rating = typeof value === "number" ? value : 0;
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(star)}
            className={`p-1 transition-colors ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
          >
            <Star 
              size={24} 
              className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-neutral-300"} 
            />
          </button>
        ))}
      </div>
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// Dropdown Select Component
export function FieldSelect({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${error ? "border-red-500 focus:border-red-500" : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"}`}
      >
        {field.options?.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// Fallback for unhandled types
export function FieldFallback({ field, disabled }: FieldProps) {
  return (
    <div className={`p-3 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 text-sm ${disabled ? "opacity-70" : ""}`}>
      Field type <strong>{field.type}</strong> is not yet fully implemented.
    </div>
  );
}
