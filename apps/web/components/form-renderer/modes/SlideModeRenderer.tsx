import React, { useState } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "../schema";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { validateField } from "@formforge/form-engine";

export function SlideModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;
  
  const hasIntro = !!(schema.title || schema.description);
  const [[page, direction], setPage] = useState([hasIntro ? -1 : 0, 0]);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const totalSteps = schema.fields.length;
  const isIntro = page === -1;
  const isComplete = page >= totalSteps;

  const paginate = (newDirection: number) => {
    if (newDirection > 0 && !isComplete && !isIntro) {
      // Validate current
      const currentField = schema.fields[page];
      if (!currentField) return;
      const error = validateField(currentField, values[currentField.id]);
      if (error) {
        setFieldError(error);
        return;
      }
    }
    
    setFieldError(null);
    setPage([page + newDirection, newDirection]);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  const currentField = (!isComplete && !isIntro) ? schema.fields[page] : null;

  return (
    <div className="w-full h-[600px] max-h-[80vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden relative font-sans text-slate-100 shadow-2xl border border-slate-800 aspect-video max-w-5xl mx-auto">
      
      {/* Slide Counter Top Right */}
      <div className="absolute top-6 right-6 text-slate-400 font-medium text-sm tracking-widest z-20">
        {isIntro ? "START" : `${Math.min(page + 1, totalSteps)} / ${totalSteps}`}
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-16">
        <AnimatePresence initial={false} custom={direction}>
          {isIntro ? (
            <motion.div
              key="intro"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full max-w-2xl flex flex-col text-center items-center justify-center"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">{schema.title || "Welcome"}</h1>
              {schema.description && (
                <p className="text-slate-400 text-xl md:text-2xl mb-12">{schema.description}</p>
              )}
              <button
                onClick={() => paginate(1)}
                className="px-10 py-5 bg-blue-600 text-white font-bold text-xl rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 flex items-center gap-3"
              >
                Start <ChevronRight size={24} />
              </button>
            </motion.div>
          ) : !isComplete ? (
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full max-w-2xl flex flex-col"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-white">
                {currentField?.label}
                {currentField?.required && <span className="text-pink-500 ml-2">*</span>}
              </h2>
              {currentField?.description && (
                <p className="text-slate-400 text-xl mb-12">{currentField.description}</p>
              )}

              <div className="w-full">
                {currentField?.type === "text" || currentField?.type === "email" || currentField?.type === "number" || currentField?.type === "phone" || currentField?.type === "date" || currentField?.type === "file" ? (
                  <input
                    autoFocus
                    type={currentField.type === "email" ? "email" : currentField.type === "number" ? "number" : currentField.type === "date" ? "date" : currentField.type === "file" ? "file" : "text"}
                    value={values[currentField.id] || ""}
                    onChange={e => { handleChange(currentField.id, e.target.value); setFieldError(null); }}
                    placeholder="Type your answer..."
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-2xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner"
                  />
                ) : currentField?.type === "textarea" ? (
                  <textarea
                    autoFocus
                    value={values[currentField.id] || ""}
                    onChange={e => { handleChange(currentField.id, e.target.value); setFieldError(null); }}
                    placeholder="Type your answer..."
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-xl text-white focus:border-blue-500 outline-none transition-colors shadow-inner min-h-[160px] resize-none"
                  />
                ) : currentField?.type === "radio" || currentField?.type === "checkbox" || currentField?.type === "select" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentField.options?.map(opt => {
                      const isMulti = currentField.type === "checkbox";
                      const valArray = (values[currentField.id] as string[]) || [];
                      const isSelected = isMulti ? valArray.includes(opt) : values[currentField.id] === opt;
                      
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            if (isMulti) {
                              handleChange(currentField.id, isSelected ? valArray.filter(v => v !== opt) : [...valArray, opt]);
                            } else {
                              handleChange(currentField.id, opt);
                            }
                            setFieldError(null);
                          }}
                          className={`flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all text-left ${
                            isSelected ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-slate-800 border-slate-700 hover:border-slate-500"
                          }`}
                        >
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
                ) : currentField?.type === "rating" ? (
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r}
                        onClick={() => { handleChange(currentField.id, r); setFieldError(null); }}
                        className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl transition-all ${
                          values[currentField.id] === r ? "bg-amber-500/20 border-amber-500 text-amber-400 scale-110 shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                ) : null}
                
                {fieldError && (
                  <div className="mt-6 text-red-400 font-medium flex items-center gap-2 bg-red-950/50 p-4 rounded-xl border border-red-900/50">
                    <span>⚠</span> {fieldError}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="submit"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-8 border-4 border-blue-500/50">
                <Check size={48} className="text-blue-400" />
              </div>
              <h2 className="text-5xl font-black mb-6">Ready to submit?</h2>
              <p className="text-slate-400 text-2xl mb-12">You've answered all questions.</p>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-12 py-5 bg-blue-600 text-white rounded-xl font-bold text-2xl shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
              >
                {isSubmitting ? "Submitting..." : "Submit Presentation"}
              </button>
              {/* Navigation Buttons */}
      {!isComplete && (
        <>
          {page > (hasIntro ? -1 : 0) && (
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white backdrop-blur transition-all border border-slate-700 z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {!isIntro && (
            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-600/90 hover:bg-blue-500 flex items-center justify-center text-white backdrop-blur transition-all border border-blue-500 z-10 shadow-lg shadow-blue-900/50"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </>
      )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 shrink-0 z-20">
        
        {/* Left Arrow */}
        <button 
          onClick={() => paginate(-1)}
          disabled={page === (hasIntro ? -1 : 0) || isSubmitting}
          className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps + (hasIntro ? 1 : 0) }).map((_, i) => {
            const stepIndex = hasIntro ? i - 1 : i;
            return (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  stepIndex === page ? "bg-blue-500 w-8" : stepIndex < page ? "bg-slate-600" : "bg-slate-800"
                }`} 
              />
            );
          })}
        </div>

        {/* Right Arrow / Finish */}
        <button 
          onClick={() => paginate(1)}
          disabled={isComplete || isSubmitting}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all disabled:opacity-0"
        >
          <ChevronRight size={28} />
        </button>

      </div>

    </div>
  );
}
