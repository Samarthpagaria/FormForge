import React, { useState, useEffect } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { FormField } from "../schema";
import { validateField } from "@formforge/form-engine";

export function OneByOneModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const hasIntro = !!(schema.title || schema.description);
  const [currentIndex, setCurrentIndex] = useState(hasIntro ? -1 : 0);
  const [direction, setDirection] = useState<"up" | "down">("down");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const totalSteps = schema.fields.length;
  const isIntro = currentIndex === -1;
  const isComplete = currentIndex >= totalSteps;
  const currentField = (!isComplete && !isIntro) ? schema.fields[currentIndex] : null;

  // Key listeners for Enter to next, Arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if they are inside a textarea with multiple lines
      if (e.key === "Enter" && !e.shiftKey && currentField?.type !== "textarea") {
        e.preventDefault();
        goNext();
      }
      // A-Z shortcuts for radio/checkbox options
      if (currentField?.options && (currentField.type === "radio" || currentField.type === "checkbox")) {
        const key = e.key.toUpperCase();
        const code = key.charCodeAt(0) - 65; // A=0, B=1
        if (code >= 0 && code < currentField.options.length) {
          e.preventDefault();
          const opt = currentField.options[code];
          if (!opt) return;
          
          if (currentField.type === "radio") {
            handleChange(currentField.id, opt);
            // Auto advance on radio selection after small delay
            setTimeout(goNext, 400);
          } else {
            const currentSelected = (values[currentField.id] as string[]) || [];
            const isSelected = currentSelected.includes(opt);
            const next = isSelected ? currentSelected.filter(o => o !== opt) : [...currentSelected, opt];
            handleChange(currentField.id, next);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentField, values]);

  const goNext = () => {
    if (isComplete) return;
    
    // Validate current field if not intro
    if (!isIntro && currentField) {
      const error = validateField(currentField, values[currentField.id]);
      if (error) {
        setFieldError(error);
        return;
      }
    }
    
    setFieldError(null);
    setDirection("down");
    setCurrentIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (currentIndex > (hasIntro ? -1 : 0)) {
      setFieldError(null);
      setDirection("up");
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    await handleSubmit();
  };

  // Variants for sliding up and down
  const variants = {
    enter: (dir: "up" | "down") => ({
      y: dir === "down" ? 100 : -100,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (dir: "up" | "down") => ({
      y: dir === "down" ? -100 : 100,
      opacity: 0
    })
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-white dark:bg-zinc-950 overflow-hidden relative font-sans text-neutral-900 dark:text-zinc-50">
      
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-100 z-50">
        <motion.div 
          className="h-full bg-violet-600"
          initial={{ width: 0 }}
          animate={{ width: isIntro ? "0%" : `${(Math.max(0, Math.min(currentIndex + 1, totalSteps)) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative w-full max-w-3xl mx-auto">
        
        <AnimatePresence mode="wait" custom={direction}>
          {isIntro ? (
            <motion.div
              key="intro"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full text-center flex flex-col items-center justify-center"
            >
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-neutral-900 dark:text-zinc-50">{schema.title || "Welcome"}</h1>
              {schema.description && (
                <p className="text-lg md:text-xl text-neutral-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto">{schema.description}</p>
              )}
              <button 
                onClick={goNext}
                className="px-8 py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
              >
                Start <ArrowDown size={20} />
              </button>
            </motion.div>
          ) : !isComplete ? (
            <motion.div
              key={`field-${currentField?.id}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              <div className="flex gap-4 mb-4 items-center text-violet-600 font-bold">
                <span className="text-sm">{currentIndex + 1} &rarr;</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {currentField?.label}
                {currentField?.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
              </h2>
              
              {currentField?.description && (
                <p className="text-neutral-500 dark:text-zinc-400 mb-8 text-lg">{currentField.description}</p>
              )}

              <div className="mt-8 mb-4">
                <FieldRenderer 
                  field={currentField!} 
                  value={values[currentField!.id]} 
                  onChange={(val) => {
                    handleChange(currentField!.id, val);
                    setFieldError(null);
                  }} 
                />
              </div>

              {fieldError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-medium bg-red-50 p-3 rounded-lg mt-4 flex items-center gap-2">
                  <span>⚠</span> {fieldError}
                </motion.div>
              )}

              {/* Navigation Footer */}
              <div className="mt-10 flex items-center gap-4 border-t border-neutral-100 dark:border-zinc-800 pt-6">
                <button 
                  onClick={goNext}
                  className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-md flex items-center gap-2"
                >
                  {currentIndex === totalSteps - 1 ? "Review" : "Next"} <ArrowDown size={18} />
                </button>
                <button 
                  onClick={goPrev}
                  className="px-6 py-3 bg-neutral-100 dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 rounded-xl font-bold hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <ArrowUp size={18} /> Back
                </button>
                <div className="ml-auto text-xs font-semibold text-neutral-400 dark:text-zinc-500">
                  Press Enter ↵
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center flex flex-col items-center"
            >
              <h2 className="text-3xl font-black mb-4">All done!</h2>
              <p className="text-neutral-500 dark:text-zinc-400 mb-8 text-lg max-w-sm">Please review your answers or submit.</p>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 bg-violet-600 text-white font-black text-lg rounded-xl shadow-xl shadow-violet-600/20 hover:bg-violet-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Navigation Arrows Bottom Right */}
      <div className="absolute bottom-6 right-6 flex items-center bg-neutral-900 rounded-lg p-1 text-white shadow-lg z-50">
        <button 
          onClick={goPrev} 
          disabled={currentIndex === 0 || isSubmitting}
          className="p-2 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowUp size={20} />
        </button>
        <div className="w-px h-6 bg-neutral-700 mx-1" />
        <button 
          onClick={goNext} 
          disabled={isComplete || isSubmitting}
          className="p-2 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ArrowDown size={20} />
        </button>
      </div>

    </div>
  );
}

// Internal Specialized Field Renderer for One-by-One Mode
function FieldRenderer({ field, value, onChange }: { field: FormField, value: any, onChange: (v: any) => void }) {
  if (field.type === "text" || field.type === "short_text" || field.type === "name" || field.type === "email" || field.type === "number" || field.type === "phone" || field.type === "file") {
    return (
      <input
        type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "file" ? "file" : "text"}
        placeholder={field.placeholder || "Type your answer here..."}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full text-2xl md:text-3xl font-medium text-violet-900 dark:text-violet-300 border-b-2 border-violet-200 dark:border-violet-800 bg-transparent py-2 outline-none focus:border-violet-600 dark:focus:border-violet-500 transition-colors placeholder:text-neutral-300 dark:placeholder:text-zinc-600"
        autoFocus
      />
    );
  }

  if (field.type === "textarea" || field.type === "long_text") {
    return (
      <textarea
        placeholder={field.placeholder || "Type your answer here..."}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full text-xl md:text-2xl font-medium text-violet-900 dark:text-violet-300 border-b-2 border-violet-200 dark:border-violet-800 bg-transparent py-2 outline-none focus:border-violet-600 dark:focus:border-violet-500 transition-colors placeholder:text-neutral-300 dark:placeholder:text-zinc-600 min-h-[120px] resize-none"
        autoFocus
      />
    );
  }

  if (field.type === "date") {
    return <OboDatePicker value={value} onChange={onChange} />;
  }

  if (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown") {
    const isMulti = field.type === "checkbox";
    const selectedArray = (value as string[]) || [];

    return (
      <div className="flex flex-col gap-3">
        {field.options?.map((opt, i) => {
          const char = String.fromCharCode(65 + i); // A, B, C...
          const isSelected = isMulti ? selectedArray.includes(opt) : value === opt;

          return (
            <button
              key={opt}
              onClick={() => {
                if (isMulti) {
                  const next = isSelected ? selectedArray.filter(o => o !== opt) : [...selectedArray, opt];
                  onChange(next);
                } else {
                  onChange(opt);
                }
              }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected 
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-900 dark:text-violet-100 shadow-sm" 
                  : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 text-neutral-700 dark:text-zinc-300"
              }`}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${
                isSelected ? "bg-violet-600 text-white" : "bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 border border-neutral-200 dark:border-zinc-700"
              }`}>
                {char}
              </div>
              <span className="text-lg font-medium">{opt}</span>
              {isSelected && <Check className="ml-auto text-violet-600" size={24} />}
            </button>
          )
        })}
        {isMulti && <div className="text-neutral-400 text-sm mt-2">Choose as many as you like</div>}
      </div>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl transition-all ${
              rating <= (value || 0)
                ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 text-yellow-500 dark:text-yellow-400 scale-110 shadow-md" 
                : "bg-white dark:bg-zinc-900 border-2 border-neutral-200 dark:border-zinc-800 hover:border-yellow-300 dark:hover:border-yellow-700 text-neutral-300 dark:text-zinc-600 hover:text-yellow-400 dark:hover:text-yellow-500"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return <div className="text-neutral-400 text-sm italic">Field type &ldquo;{field.type}&rdquo; is not supported in this mode.</div>;
}

// ─── Inline Date Picker for One-by-One Mode ───────────────────────────────────
const OBO_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const OBO_DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function OboDatePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const parse = (v?: string) => { if (!v) return null; const d = new Date(v + "T00:00:00"); return isNaN(d.getTime()) ? null : d; };
  const today    = new Date();
  const selected = parse(value);
  const [vy, setVy] = React.useState(selected?.getFullYear() ?? today.getFullYear());
  const [vm, setVm] = React.useState(selected?.getMonth()    ?? today.getMonth());

  const dim      = new Date(vy, vm + 1, 0).getDate();
  const firstDay = new Date(vy, vm, 1).getDay();

  const pick = (day: number) => {
    const d  = new Date(vy, vm, day);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${d.getFullYear()}-${mm}-${dd}`);
  };
  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); };

  return (
    <div className="w-full max-w-sm select-none bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prev} className="p-2 hover:bg-violet-50 rounded-lg text-violet-600 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-neutral-800">{OBO_MONTHS[vm]} {vy}</span>
        <button type="button" onClick={next} className="p-2 hover:bg-violet-50 rounded-lg text-violet-600 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {OBO_DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-neutral-400 py-1">{d}</div>)}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: dim }, (_, i) => i + 1).map(day => {
          const isSel   = selected && selected.getFullYear() === vy && selected.getMonth() === vm && selected.getDate() === day;
          const isToday = today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === day;
          return (
            <button key={day} type="button" onClick={() => pick(day)}
              className={`w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                isSel   ? "bg-violet-600 text-white shadow-md scale-105" :
                isToday ? "bg-violet-100 text-violet-700 font-bold" :
                          "hover:bg-neutral-100 text-neutral-700"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-center text-sm text-violet-600 font-semibold mt-3">
          {selected.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}
    </div>
  );
}
