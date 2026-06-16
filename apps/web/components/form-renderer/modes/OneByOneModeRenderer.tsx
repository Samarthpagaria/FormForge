import React, { useState, useEffect } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { FormField } from "../schema";
import { validateField } from "@formforge/form-engine";

export function OneByOneModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("down");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const totalSteps = schema.fields.length;
  const isComplete = currentIndex >= totalSteps;
  const currentField = !isComplete ? schema.fields[currentIndex] : null;

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
    
    // Validate current field
    const error = validateField(currentField!, values[currentField!.id]);
    if (error) {
      setFieldError(error);
      return;
    }
    
    setFieldError(null);
    setDirection("down");
    setCurrentIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
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
    <div className="w-full h-full min-h-[600px] flex flex-col bg-white overflow-hidden relative font-sans text-neutral-900">
      
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-100 z-50">
        <motion.div 
          className="h-full bg-violet-600"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.min(currentIndex, totalSteps) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative w-full max-w-3xl mx-auto">
        
        <AnimatePresence mode="wait" custom={direction}>
          {!isComplete ? (
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
                {currentField?.required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              
              {currentField?.description && (
                <p className="text-neutral-500 mb-8 text-lg">{currentField.description}</p>
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

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  OK <Check size={18} />
                </button>
                <span className="text-sm font-medium text-neutral-400">press Enter ↵</span>
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
              <p className="text-neutral-500 mb-8 text-lg max-w-sm">Please review your answers or submit.</p>
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
  if (field.type === "text" || field.type === "email" || field.type === "number" || field.type === "phone") {
    return (
      <input
        type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
        placeholder={field.placeholder || "Type your answer here..."}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full text-2xl md:text-3xl font-medium text-violet-900 border-b-2 border-violet-200 bg-transparent py-2 outline-none focus:border-violet-600 transition-colors placeholder:text-neutral-300"
        autoFocus
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        placeholder={field.placeholder || "Type your answer here..."}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full text-xl md:text-2xl font-medium text-violet-900 border-b-2 border-violet-200 bg-transparent py-2 outline-none focus:border-violet-600 transition-colors placeholder:text-neutral-300 min-h-[120px] resize-none"
        autoFocus
      />
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
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
                  ? "border-violet-600 bg-violet-50 text-violet-900 shadow-sm" 
                  : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-violet-300 text-neutral-700"
              }`}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${
                isSelected ? "bg-violet-600 text-white" : "bg-neutral-100 text-neutral-500 border border-neutral-200"
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
              value === rating 
                ? "bg-yellow-100 border-2 border-yellow-400 text-yellow-500 scale-110 shadow-md" 
                : "bg-white border-2 border-neutral-200 hover:border-yellow-300 text-neutral-300 hover:text-yellow-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return <div>Unsupported field type in this mode.</div>;
}
