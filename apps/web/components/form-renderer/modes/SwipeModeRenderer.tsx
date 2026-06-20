import React, { useState } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { FormField } from "../schema";
import { validateField } from "@formforge/form-engine";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function SwipeModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
 const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;
 
 const [currentIndex, setCurrentIndex] = useState(-1);
 const [direction, setDirection] = useState<number>(0);
 const [fieldError, setFieldError] = useState<string | null>(null);

 const totalSteps = schema.fields.length;
 const isComplete = currentIndex >= totalSteps;

 const handleSwipe = (swipeDir: "left" | "right") => {
 if (isComplete) return;
 if (currentIndex === -1) {
 setDirection(swipeDir === "right" ? 1 : -1);
 setCurrentIndex(0);
 return;
 }
 const currentField = schema.fields[currentIndex];
 if (!currentField) return;

 // Validate if it's text/email (requires input)
 if (currentField.type === "text" || currentField.type === "email" || currentField.type === "number" || currentField.type === "textarea") {
 const error = validateField(currentField, values[currentField.id]);
 if (error) {
 setFieldError(error);
 return;
 }
 }

 // For boolean/radio via swipe (e.g., Right = Yes/Confirm, Left = No/Skip)
 // Here we'll just implement a generic advance on swipe for text, and mapped choices for Yes/No if options exist.
 if (currentField.options && currentField.type === "radio") {
 // If 2 options, Left = option 0, Right = option 1
 if (currentField.options.length === 2) {
 const val = swipeDir === "left" ? currentField.options[0] : currentField.options[1];
 handleChange(currentField.id, val);
 } else {
 // If more options, just ensure one is selected
 const error = validateField(currentField, values[currentField.id]);
 if (error) {
 setFieldError("Please select an option before swiping");
 return;
 }
 }
 } else if (currentField.type === "checkbox") {
 const error = validateField(currentField, values[currentField.id]);
 if (error) {
 setFieldError("Please select at least one option");
 return;
 }
 }

 setFieldError(null);
 setDirection(swipeDir === "right" ? 1 : -1);
 setCurrentIndex(prev => prev + 1);
 };

 const goBack = () => {
 if (currentIndex > 0) {
 setFieldError(null);
 setDirection(-1);
 setCurrentIndex(prev => prev - 1);
 }
 };

 const currentField = !isComplete ? schema.fields[currentIndex] : null;

 return (
 <div className="w-full h-[650px] max-h-[85vh] flex flex-col bg-[#f0f0f5] rounded-3xl overflow-hidden relative font-sans text-neutral-900 shadow-2xl items-center justify-center">
 
 {/* Progress */}
 <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
 <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-neutral-500 shadow-sm border border-neutral-200 ">
 {currentIndex === -1 ? "Cover" : `${Math.min(currentIndex + 1, totalSteps)} / ${totalSteps}`}
 </div>
 </div>

 <div className="relative w-full max-w-[340px] h-[480px] flex items-center justify-center perspective-[1000px]">
 <AnimatePresence initial={false}>
 {isComplete ? (
 <motion.div
 key="complete"
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center border border-neutral-200 "
 >
 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
 <span className="text-3xl">🎉</span>
 </div>
 <h2 className="text-2xl font-bold mb-2 text-neutral-900 ">You're done!</h2>
 <p className="text-neutral-500 text-sm mb-8">Ready to submit your answers?</p>
 <button
 onClick={() => handleSubmit()}
 disabled={isSubmitting}
 className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
 >
 {isSubmitting ? "Submitting..." : "Submit"}
 </button>
 </motion.div>
 ) : currentIndex === -1 ? (
 <motion.div
 key="cover"
 className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center border border-neutral-200 cursor-grab active:cursor-grabbing"
 initial={{ x: direction === 0 ? 0 : direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 15 : -15 }}
 animate={{ x: 0, opacity: 1, rotate: 0 }}
 exit={{ x: direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 15 : -15 }}
 transition={{ type: "spring", stiffness: 300, damping: 25 }}
 drag="x"
 dragConstraints={{ left: 0, right: 0 }}
 onDragEnd={(e, info) => { if (info.offset.x > 80) handleSwipe("right"); else if (info.offset.x < -80) handleSwipe("left"); }}
 >
 <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-3">{schema.title || "Untitled Form"}</h2>
 <p className="text-neutral-500 text-sm leading-relaxed mb-8">{schema.description || "Swipe right or press Next to begin."}</p>
 <div className="flex items-center gap-2 text-violet-600 text-sm font-bold animate-pulse">
 Swipe to start <span className="text-xl">→</span>
 </div>
 </motion.div>
 ) : (
 <SwipeCard
 key={currentField!.id}
 field={currentField!}
 value={values[currentField!.id]}
 onChange={(val) => { handleChange(currentField!.id, val); setFieldError(null); }}
 onSwipe={handleSwipe}
 direction={direction}
 error={fieldError}
 />
 )}
 </AnimatePresence>

 {/* Stack visuals for upcoming cards */}
 {!isComplete && currentIndex + 1 < totalSteps && (
 <div className="absolute w-full h-full bg-white rounded-3xl shadow-md border border-neutral-200 -z-10 scale-[0.95] translate-y-4 opacity-50 pointer-events-none" />
 )}
 {!isComplete && currentIndex + 2 < totalSteps && (
 <div className="absolute w-full h-full bg-white rounded-3xl shadow-sm border border-neutral-200 -z-20 scale-[0.90] translate-y-8 opacity-20 pointer-events-none" />
 )}

 </div>

 {/* Manual Swipe Buttons */}
 {!isComplete && (
 <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-20">
 <button 
 onClick={() => goBack()}
 disabled={currentIndex === 0}
 className="w-14 h-14 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center text-violet-600 hover:text-violet-800 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
 title="Go Back"
 >
 <span className="text-xl">←</span>
 </button>
 <button 
 onClick={() => handleSwipe("right")}
 className="w-14 h-14 bg-violet-600 rounded-full shadow-lg border border-violet-700 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
 title="Next Question"
 >
 <span className="text-xl">→</span>
 </button>
 </div>
 )}
 </div>
 );
}

function SwipeCard({ 
 field, 
 value, 
 onChange, 
 onSwipe, 
 direction, 
 error 
}: { 
 field: FormField, 
 value: any, 
 onChange: (v: any) => void, 
 onSwipe: (dir: "left" | "right") => void,
 direction: number,
 error: string | null
}) {
 const x = useMotionValue(0);
 const rotate = useTransform(x, [-200, 200], [-15, 15]);
 const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
 
 // Generic tint overlays based on drag
 const backgroundRight = useTransform(x, [0, 100], ["rgba(139, 92, 246, 0)", "rgba(139, 92, 246, 0.15)"]);
 const backgroundLeft = useTransform(x, [-100, 0], ["rgba(139, 92, 246, 0.15)", "rgba(139, 92, 246, 0)"]);

 const handleDragEnd = (event: any, info: any) => {
 const threshold = 80;
 if (info.offset.x > threshold) {
 onSwipe("right");
 } else if (info.offset.x < -threshold) {
 onSwipe("left");
 }
 };

 return (
 <motion.div
 className="absolute w-full h-full bg-white rounded-3xl shadow-xl border border-neutral-200 flex flex-col p-6 cursor-grab active:cursor-grabbing overflow-hidden"
 style={{ x, rotate, opacity }}
 drag="x"
 dragConstraints={{ left: 0, right: 0 }}
 dragElastic={0.8}
 onDragEnd={handleDragEnd}
 initial={{ x: direction === 0 ? 0 : direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 15 : -15 }}
 animate={{ x: 0, opacity: 1, rotate: 0 }}
 exit={{ x: direction > 0 ? 300 : -300, opacity: 0, rotate: direction > 0 ? 15 : -15 }}
 transition={{ type: "spring", stiffness: 300, damping: 25 }}
 >
 <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ background: backgroundRight }} />
 <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ background: backgroundLeft }} />

 <div className="relative z-10 flex flex-col h-full pointer-events-auto">
 <h3 className="text-xl font-bold tracking-tight mb-2">
 {field.label} {field.required && <span className="text-red-500">*</span>}
 </h3>
 {field.description && <p className="text-sm text-neutral-500 mb-6">{field.description}</p>}

 <div className="flex-1 flex flex-col justify-center" onPointerDownCapture={(e) => e.stopPropagation()}>
 {(field.type === "text" || field.type === "short_text" || field.type === "name" || field.type === "email" || field.type === "number" || (field.type === "phone" || field.type === "tel") || field.type === "file") ? (
 <input
 type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "file" ? "file" : "text"}
 placeholder="Type here..."
 value={value || ""}
 onChange={e => onChange(e.target.value)}
 className="w-full text-lg border-b-2 border-neutral-200 py-2 outline-none focus:border-violet-500 bg-transparent text-center"
 />
 ) : (field.type === "textarea" || field.type === "long_text") ? (
 <textarea
 placeholder="Type here..."
 value={value || ""}
 onChange={e => onChange(e.target.value)}
 className="w-full text-base border-2 border-neutral-200 rounded-xl p-3 outline-none focus:border-violet-500 bg-transparent resize-none min-h-[120px]"
 />
 ) : field.type === "date" ? (
 <CardDatePicker value={value} onChange={onChange} />
 ) : (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown") ? (
 <div className="flex flex-col gap-2">
 {field.options?.map(opt => {
 const isSelected = field.type === "checkbox" ? ((value as string[]) || []).includes(opt) : value === opt;
 return (
 <button
 key={opt}
 onClick={() => {
 if (field.type === "checkbox") {
 const current = (value as string[]) || [];
 onChange(isSelected ? current.filter(o => o !== opt) : [...current, opt]);
 } else {
 onChange(opt);
 }
 }}
 className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left ${
 isSelected ? "bg-violet-600 border-violet-600 text-white" : "bg-neutral-50 border-neutral-200 hover:border-violet-300"
 }`}
 >
 {opt}
 </button>
 )
 })}
 </div>
 ) : field.type === "rating" ? (
 <div className="flex justify-center gap-2">
 {[1, 2, 3, 4, 5].map(r => (
 <button
 key={r}
 onClick={() => onChange(r)}
 className={`text-3xl transition-all ${r <= (value || 0) ? "text-yellow-400 scale-110" : "text-neutral-200 hover:text-yellow-200"}`}
 >
 ★
 </button>
 ))}
 </div>
 ) : null}
 </div>

 {error && (
 <div className="text-red-500 text-xs font-bold text-center mt-4 bg-red-50 py-1 rounded-md">
 {error}
 </div>
 )}

 <div className="mt-auto pt-6 text-center text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
 Swipe to continue
 </div>
 </div>
 </motion.div>
 );
}

// ─── Inline Date Picker for Card Mode ─────────────────────────────────────────
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEK_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CardDatePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
 const parseDate = (v?: string): Date | null => {
 if (!v) return null;
 const d = new Date(v + "T00:00:00");
 return isNaN(d.getTime()) ? null : d;
 };
 const today = new Date();
 const selected = parseDate(value);
 const [viewYear, setViewYear] = React.useState(selected?.getFullYear() ?? today.getFullYear());
 const [viewMonth, setViewMonth] = React.useState(selected?.getMonth() ?? today.getMonth());

 const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
 const firstDay = new Date(viewYear, viewMonth, 1).getDay();

 const pick = (day: number) => {
 const d = new Date(viewYear, viewMonth, day);
 const yyyy = d.getFullYear();
 const mm = String(d.getMonth() + 1).padStart(2, "0");
 const dd = String(d.getDate()).padStart(2, "0");
 onChange(`${yyyy}-${mm}-${dd}`);
 };

 const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
 const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

 return (
 <div className="w-full select-none">
 <div className="flex items-center justify-between mb-2">
 <button type="button" onClick={prev} className="p-1 hover:bg-neutral-100 rounded-lg text-violet-600 transition-colors">
 <ChevronLeft size={16} />
 </button>
 <span className="font-semibold text-sm text-neutral-800">{MONTHS_SHORT[viewMonth]} {viewYear}</span>
 <button type="button" onClick={next} className="p-1 hover:bg-neutral-100 rounded-lg text-violet-600 transition-colors">
 <ChevronRight size={16} />
 </button>
 </div>
 <div className="grid grid-cols-7 mb-1">
 {WEEK_DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-neutral-400 py-0.5">{d}</div>)}
 </div>
 <div className="grid grid-cols-7 gap-y-0.5">
 {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
 {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
 const isSel = selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
 const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
 return (
 <button key={day} type="button" onClick={() => pick(day)}
 className={`w-full aspect-square rounded-md text-xs font-medium transition-colors ${
 isSel ? "bg-violet-600 text-white" : isToday ? "bg-violet-100 text-violet-700 font-bold" : "hover:bg-neutral-100 text-neutral-700"
 }`}>
 {day}
 </button>
 );
 })}
 </div>
 {selected && (
 <p className="text-center text-xs text-violet-600 font-semibold mt-2">
 Selected: {selected.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
 </p>
 )}
 </div>
 );
}
