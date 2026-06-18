import React, { useState, useRef, useEffect } from "react";
import { FormField } from "./schema";
import { Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface FieldProps {
  field: FormField;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
  error?: string;
}

// ─── Text / Short Text ────────────────────────────────────────────────────────
export function FieldText({ field, disabled, value, onChange, error }: FieldProps) {
  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "phone"
      ? "tel"
      : field.type === "number"
      ? "number"
      : field.type === "file"
      ? "file"
      : "text"; // covers text, short_text, name, etc.

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type={inputType}
        placeholder={field.placeholder}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"
        }`}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ─── Long Text / Textarea ─────────────────────────────────────────────────────
export function FieldTextarea({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <textarea
        placeholder={field.placeholder || "Type your answer here…"}
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        rows={4}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed resize-y ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"
        }`}
      />
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export function FieldDatePicker({ field, disabled, value, onChange, error }: FieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse stored yyyy-mm-dd → Date object
  const parseValue = (): Date | null => {
    if (!value) return null;
    const d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  };

  const today = new Date();
  const [viewYear, setViewYear] = useState(() => parseValue()?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseValue()?.getMonth() ?? today.getMonth());

  const selected = parseValue();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange?.(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const displayLabel = selected
    ? selected.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : field.placeholder || "Pick a date";

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:cursor-not-allowed ${
          error
            ? "border-red-500"
            : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"
        } ${selected ? "text-neutral-900" : "text-neutral-400"}`}
      >
        <span>{displayLabel}</span>
        <Calendar size={16} className="text-violet-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded-md transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-sm text-neutral-800">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded-md transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-neutral-400 py-1">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isSelected =
                selected &&
                selected.getFullYear() === viewYear &&
                selected.getMonth() === viewMonth &&
                selected.getDate() === day;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`w-full aspect-square rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-violet-600 text-white"
                      : isToday
                      ? "bg-violet-100 text-violet-700 font-bold"
                      : "hover:bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ─── Radio Group ──────────────────────────────────────────────────────────────
export function FieldRadioGroup({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {field.options?.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-2 text-sm text-neutral-700 ${
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
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

// ─── Checkbox Group ───────────────────────────────────────────────────────────
export function FieldCheckboxGroup({ field, disabled, value, onChange, error }: FieldProps) {
  const selected = Array.isArray(value) ? value : [];

  const handleToggle = (opt: string) => {
    if (disabled) return;
    if (selected.includes(opt)) {
      onChange?.(selected.filter((o) => o !== opt));
    } else {
      onChange?.([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {field.options?.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-2 text-sm text-neutral-700 ${
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
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

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function FieldRating({ field, disabled, value, onChange, error }: FieldProps) {
  const [hovered, setHovered] = useState(0);
  const rating = typeof value === "number" ? value : 0;
  const active = hovered || rating;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`p-1 transition-transform ${
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
            }`}
          >
            <Star
              size={24}
              className={
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-neutral-300"
              }
            />
          </button>
        ))}
      </div>
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// ─── Dropdown Select ──────────────────────────────────────────────────────────
export function FieldSelect({ field, disabled, value, onChange, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 bg-white text-neutral-900 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-neutral-200 hover:border-neutral-300 focus:border-violet-500"
        }`}
      >
        <option value="" disabled>
          {field.placeholder || "Select an option…"}
        </option>
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

// ─── Fallback ─────────────────────────────────────────────────────────────────
export function FieldFallback({ field, disabled }: FieldProps) {
  return (
    <div
      className={`p-3 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 text-sm ${
        disabled ? "opacity-70" : ""
      }`}
    >
      Field type <strong>{field.type}</strong> is not yet supported.
    </div>
  );
}
