import React, { useState, useEffect, useRef } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "../schema";
import { Send } from "lucide-react";
import { validateField } from "@formforge/form-engine";

type StoryChunk = {
  id: string;
  field?: FormField;
  textBefore: string;
  isAnswered: boolean;
};

export function StoryModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;
  
  const [chunks, setChunks] = useState<StoryChunk[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Simple input types that can be rendered with a generic <input> element
  const simpleInputTypes = new Set<string>(["text", "short_text", "long_text", "name", "email", "number", "phone", "textarea", "date", "file", "password", "time", "datetime", "color", "range", "url", "hidden"]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize chunks based on schema
  useEffect(() => {
    const initialChunks: StoryChunk[] = schema.fields.map((f, i) => {
      // Create a narrative sentence for each field
      let textBefore = "";
      if (i === 0) {
        textBefore = `Hello! Welcome to ${schema.title || "this form"}. `;
        if (schema.description) textBefore += `${schema.description} `;
        textBefore += `To start, ${f.label.toLowerCase()}${f.required ? " *" : ""}? `;
      } else {
        const intros = ["Got it. And what about ", "Thanks! Next, ", "Moving on, ", "Could you also tell me "];
        const intro = intros[i % intros.length];
        textBefore = `${intro}${f.label.toLowerCase()}${f.required ? " *" : ""}? `;
      }
      return { id: f.id, field: f, textBefore, isAnswered: false };
    });
    setChunks(initialChunks);
  }, [schema]);

  const scrollToBottom = () => {
    setTimeout(() => {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleInputSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentIndex >= chunks.length) return;

    const chunk = chunks[currentIndex];
    if (!chunk) return;
    const field = chunk.field;
    if (!field) return;

    const val = inputValue.trim();

    // Specific logic for radio/checkbox where value is already in engine.values
    let finalVal = val;
    if (field.type === "radio" || field.type === "checkbox" || field.type === "rating" || field.type === "select") {
      finalVal = values[field.id]; // They selected it via inline UI
      if (field.type === "checkbox" && Array.isArray(finalVal)) {
        if (finalVal.length === 0) finalVal = "";
      }
    }

    const error = validateField(field, finalVal);
    if (error) {
      setFieldError(error);
      return;
    }

    if (["text","short_text","long_text","name","email","number","phone","textarea","date","file"].includes(field.type)) {
      handleChange(field.id, finalVal);
    }

    setFieldError(null);
    setInputValue("");
    
    // Mark as answered
    setChunks(prev => prev.map((c, i) => i === currentIndex ? { ...c, isAnswered: true } : c));
    setCurrentIndex(prev => prev + 1);
    scrollToBottom();
  };

  const handleFinalSubmit = async () => {
    await handleSubmit();
  };

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl h-[70vh] bg-[#fdfcfb] dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-y-auto p-8 md:p-12 font-serif text-xl md:text-2xl leading-relaxed text-neutral-800 dark:text-zinc-200 border border-[#f0ebe1] dark:border-zinc-800"
        ref={containerRef}
      >
        <AnimatePresence>
          {chunks.slice(0, currentIndex + 1).map((chunk, idx) => {
            const isCurrent = idx === currentIndex;
            const field = chunk.field;
            if (!field) return null;
            const value = values[field.id];

            return (
              <motion.div 
                key={chunk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`mb-8 ${isCurrent ? "" : "opacity-60"}`}
              >
                <span>{chunk.textBefore}</span>
                {field.description && !chunk.isAnswered && (
                  <p className="text-sm text-[#c97064]/70 italic mt-1 mb-2">{field.description}</p>
                )}
                
                {chunk.isAnswered ? (
                  <span className="font-bold text-[#c97064] border-b-2 border-dashed border-[#c97064]/30 px-2 ml-2">
                    {Array.isArray(value) ? value.join(", ") : value}
                  </span>
                ) : (
                  <span className="inline-block align-middle ml-2 relative top-[-2px]">
                    {simpleInputTypes.has(field.type) ? (
                      <form onSubmit={handleInputSubmit} className="inline-flex items-end">
                        {(field.type === "textarea" || field.type === "long_text") ? (
                          <textarea
                            autoFocus
                            value={inputValue}
                            onChange={(e) => { setInputValue(e.target.value); setFieldError(null); }}
                            placeholder="Type here..."
                            className="w-48 md:w-64 bg-transparent border-b-2 border-[#c97064] outline-none text-[#c97064] font-bold text-xl md:text-2xl py-1 px-2 placeholder:font-normal placeholder:text-[#c97064]/40 min-h-[40px] resize-none overflow-hidden"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleInputSubmit(e as any);
                              }
                            }}
                          />
                        ) : (
                          <input
                            autoFocus
                            type={(() => {
                              const typeMap: Record<string, string> = {
                                text: "text", short_text: "text", name: "text",
                                email: "email", number: "number", phone: "tel",
                                password: "password", date: "date", time: "time",
                                datetime: "datetime-local", color: "color",
                                range: "range", url: "url", hidden: "hidden", file: "file",
                              };
                              return typeMap[field.type] || "text";
                            })()}
                            value={field.type === "file" ? undefined : inputValue}
                            onChange={(e) => {
                              if (field.type === "file") {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleChange(field.id, file);
                              } else {
                                setInputValue(e.target.value);
                              }
                              setFieldError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleInputSubmit(e as any); }
                            }}
                            placeholder="Type here..."
                            className="w-48 md:w-64 bg-transparent border-b-2 border-[#c97064] outline-none text-[#c97064] font-bold text-xl md:text-2xl py-1 px-2 placeholder:font-normal placeholder:text-[#c97064]/40"
                          />
                        )}
                        <button type="submit" disabled={!inputValue.trim() && field.type !== "file"} className="ml-2 text-[#c97064] hover:text-[#a05247] disabled:opacity-30 disabled:hover:text-[#c97064]">
                          <Send size={24} />
                        </button>
                      </form>
                    ) : field.type === "radio" || field.type === "checkbox" || field.type === "select" ? (
                      <div className="block mt-4 text-sans text-base font-sans font-medium">
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map(opt => {
                            const isMulti = field.type === "checkbox";
                            const isSelected = isMulti ? (value as string[] || []).includes(opt) : value === opt;
                            
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  if (isMulti) {
                                    const curr = value as string[] || [];
                                    handleChange(field.id, isSelected ? curr.filter(o => o !== opt) : [...curr, opt]);
                                  } else {
                                    handleChange(field.id, opt);
                                  }
                                  setFieldError(null);
                                }}
                                className={`px-4 py-2 rounded-full border transition-all ${
                                  isSelected ? "bg-[#c97064] text-white border-[#c97064] shadow-md" : "bg-white dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 border-neutral-300 dark:border-zinc-700 hover:border-[#c97064] dark:hover:border-[#c97064]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        <button onClick={() => handleInputSubmit()} className="mt-4 px-6 py-2 bg-neutral-900 dark:bg-zinc-700 text-white rounded-full text-sm flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-zinc-600">
                          Confirm <Send size={14} />
                        </button>
                      </div>
                    ) : field.type === "rating" ? (
                       <div className="inline-flex items-center gap-2 mt-2">
                         {[1, 2, 3, 4, 5].map(r => (
                           <button key={r} onClick={() => { handleChange(field.id, r); setFieldError(null); }} className={`text-3xl transition-all ${r <= (value || 0) ? "text-yellow-500 scale-110" : "text-neutral-300 dark:text-zinc-600 hover:text-yellow-300 dark:hover:text-yellow-400"}`}>
                             ★
                           </button>
                         ))}
                         <button onClick={() => handleInputSubmit()} disabled={!value} className="ml-4 text-[#c97064] disabled:opacity-30">
                          <Send size={24} />
                         </button>
                       </div>
                    ) : (
                      <span className="text-sm text-neutral-400 dark:text-zinc-500 border border-neutral-200 dark:border-zinc-700 px-2 py-1 rounded">Unsupported field</span>
                    )}
                    
                    {fieldError && (
                      <div className="absolute top-full mt-2 left-0 text-red-500 text-sm font-sans font-bold bg-red-50 px-2 py-1 rounded shadow-sm whitespace-nowrap z-10">
                        {fieldError}
                      </div>
                    )}
                  </span>
                )}
              </motion.div>
            );
          })}
          
          {currentIndex >= chunks.length && chunks.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center pb-12">
              <p className="text-xl italic text-neutral-500 dark:text-zinc-400 mb-8">"And that's the end of our story."</p>
              <button onClick={handleFinalSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#c97064] text-white rounded-full font-sans font-bold shadow-lg hover:bg-[#a05247] hover:shadow-xl transition-all disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit Answers"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
