import React, { useState, useEffect, useRef } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { FormField } from "../schema";
import { validateField } from "@formforge/form-engine";

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
  fieldId?: string;
};

export function ChatModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, isSubmitting, handleChange, handleSubmit } = engine;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro-title", sender: "bot", text: `Hi there! Let's get started with: **${schema.title}**` },
  ]);

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const [ratingHovered, setRatingHovered] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Add description on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (schema.description) {
      setMessages(prev => {
        if (prev.some(m => m.id === "intro-desc")) return prev;
        return [...prev, { id: "intro-desc", sender: "bot", text: schema.description! }];
      });
    }
  }, [schema.description]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, fieldError]);

  // ── Ask next question ──────────────────────────────────────────────────────
  useEffect(() => {
    let t: NodeJS.Timeout;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.sender !== "user" && lastMessage.id !== "intro-title" && lastMessage.id !== "intro-desc") return;

    if (currentFieldIndex < schema.fields.length) {
      setIsTyping(true);
      t = setTimeout(() => {
        const f = schema.fields[currentFieldIndex];
        if (!f) return;
        let qText = f.label;
        if (f.required) qText += " *";
        if (f.description) qText += `\n\n_${f.description}_`;
        setMessages(prev => [...prev, { id: `q-${f.id}`, sender: "bot", text: qText, fieldId: f.id }]);
        setIsTyping(false);
        setInputValue("");
        setFieldError(null);
        if (f.type === "checkbox") setTempSelection(values[f.id] || []);
      }, 800);
    } else if (currentFieldIndex === schema.fields.length) {
      setIsTyping(true);
      t = setTimeout(() => {
        setMessages(prev => [...prev, { id: "outro", sender: "bot", text: "Great! That's all the questions. Ready to submit?" }]);
        setIsTyping(false);
      }, 800);
    }

    return () => clearTimeout(t);
  }, [currentFieldIndex, messages.length]);

  // ── Submit a user answer ───────────────────────────────────────────────────
  const handleUserSubmit = (overrideVal?: any, displayVal?: string) => {
    if (currentFieldIndex >= schema.fields.length) return;
    const field = schema.fields[currentFieldIndex];
    if (!field) return;

    const val = overrideVal !== undefined ? overrideVal : inputValue;
    const err = validateField(field, val);
    if (err) { setFieldError(err); return; }

    handleChange(field.id, val);

    let display = displayVal !== undefined ? displayVal : typeof val === "string" ? val : "";
    if (Array.isArray(val)) display = val.join(", ");
    if (typeof val === "number") display = displayVal || String(val);

    setMessages(prev => [...prev, { id: `a-${field.id}-${Date.now()}`, sender: "user", text: display }]);
    setCurrentFieldIndex(prev => prev + 1);
    setFieldError(null);
    setInputValue("");
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setMessages(prev => [...prev, { id: "submit-action", sender: "user", text: "Submit Form" }]);
    setIsTyping(true);
    const ok = await handleSubmit();
    setIsTyping(false);
    setMessages(prev => [...prev, ok
      ? { id: "success", sender: "bot", text: "🎉 Successfully submitted! Thank you!" }
      : { id: "error",   sender: "bot", text: "❌ Oops, there was an error submitting." },
    ]);
  };

  const currentField = currentFieldIndex < schema.fields.length ? schema.fields[currentFieldIndex] : null;

  // ── Determine if the latest bot message is the current question ────────────
  const lastBotIsCurrentField = (() => {
    if (!currentField) return false;
    const last = messages[messages.length - 1];
    return last?.sender === "bot" && last?.fieldId === currentField.id;
  })();

  // ── Inline interactive component (above input bar) ─────────────────────────
  const renderInlineInteractive = () => {
    if (isTyping || !currentField || !lastBotIsCurrentField) return null;

    // Radio / select / dropdown → pill buttons
    if ((currentField.type === "radio" || currentField.type === "select" || currentField.type === "dropdown") && currentField.options) {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
          {currentField.options.map(opt => (
            <button key={opt} onClick={() => handleUserSubmit(opt, opt)}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-400 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95">
              {opt}
            </button>
          ))}
        </motion.div>
      );
    }

    // Checkbox → multi-select pills + confirm
    if (currentField.type === "checkbox" && currentField.options) {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-2 max-w-[85%]">
          <div className="flex flex-wrap gap-2">
            {currentField.options.map(opt => {
              const isSel = tempSelection.includes(opt);
              return (
                <button key={opt} onClick={() => setTempSelection(prev => isSel ? prev.filter(p => p !== opt) : [...prev, opt])}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border ${
                    isSel ? "bg-blue-600 text-white border-blue-600" : "bg-white text-neutral-700 border-neutral-200 hover:border-blue-300"
                  }`}>
                  {isSel && <Check size={13} />}
                  {opt}
                </button>
              );
            })}
          </div>
          <button onClick={() => handleUserSubmit(tempSelection)}
            className="self-start px-5 py-2 bg-neutral-900 text-white rounded-full text-sm font-semibold shadow-md hover:bg-neutral-800 flex items-center gap-2 active:scale-95">
            Confirm <Send size={13} />
          </button>
        </motion.div>
      );
    }

    // Rating → star buttons with glow for ≤ N
    if (currentField.type === "rating") {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button key={r}
              onMouseEnter={() => setRatingHovered(r)}
              onMouseLeave={() => setRatingHovered(0)}
              onClick={() => handleUserSubmit(r, `${r} Star${r > 1 ? "s" : ""}`)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all ${
                r <= (ratingHovered || 0) ? "text-yellow-500 scale-115 bg-yellow-50" : "text-neutral-300 bg-white border border-neutral-200 hover:bg-yellow-50"
              }`}>
              ★
            </button>
          ))}
        </motion.div>
      );
    }

    // Date picker → inline calendar
    if (currentField.type === "date") {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 mt-2">
          <ChatDatePicker
            value={values[currentField.id]}
            onChange={v => handleChange(currentField.id, v)}
          />
          <button
            onClick={() => handleUserSubmit(values[currentField.id], values[currentField.id])}
            disabled={!values[currentField.id]}
            className="self-start px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            Confirm date <Send size={13} />
          </button>
        </motion.div>
      );
    }

    return null;
  };

  // ── Bottom input bar per field type ───────────────────────────────────────
  const renderBottomInput = () => {
    if (!currentField || !lastBotIsCurrentField || isTyping) return null;

    // Types handled inline (no bottom text box)
    if (["radio","select","dropdown","checkbox","rating","date"].includes(currentField.type)) return null;

    const isTextarea = currentField.type === "textarea" || currentField.type === "long_text";

    return (
      <div className={`flex items-end gap-2 bg-neutral-50 border rounded-2xl p-2 transition-colors ${
        fieldError ? "border-red-300" : "border-neutral-200 focus-within:border-blue-300 focus-within:bg-white"
      }`}>
        {isTextarea ? (
          <textarea
            autoFocus
            rows={2}
            value={inputValue}
            placeholder={currentField.placeholder || "Type your answer…"}
            onChange={e => { setInputValue(e.target.value); setFieldError(null); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleUserSubmit(); } }}
            className="flex-1 bg-transparent text-sm text-neutral-800 outline-none resize-none placeholder:text-neutral-400 px-2 py-1"
          />
        ) : (
          <input
            autoFocus
            type={
              currentField.type === "email"  ? "email"  :
              currentField.type === "number" ? "number" :
              currentField.type === "phone"  ? "tel"    : "text"
            }
            value={inputValue}
            placeholder={currentField.placeholder || "Type your answer…"}
            onChange={e => { setInputValue(e.target.value); setFieldError(null); }}
            onKeyDown={handleEnterKey}
            className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 px-2 py-1"
          />
        )}
        <button type="button"
          onClick={() => handleUserSubmit()}
          disabled={isTyping || (!inputValue.trim())}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:bg-neutral-300 transition-colors shadow-sm">
          <Send size={16} className="ml-0.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-[600px] max-h-[80vh] max-w-[500px] mx-auto bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-neutral-200/60 dark:border-zinc-800/80 overflow-hidden relative">

      {/* Ambient background */}
      <div className="absolute inset-0 z-0 opacity-60 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[300px] h-[300px] bg-blue-100 rounded-full blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] -right-[20%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-10 flex items-center gap-3 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-neutral-800 dark:text-zinc-100 truncate">{schema.title || "Untitled Form"}</h2>
          {schema.description ? (
            <p className="text-[11px] text-neutral-500 dark:text-zinc-400 font-medium truncate">{schema.description}</p>
          ) : (
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 z-10 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 text-neutral-800 dark:text-zinc-100 rounded-bl-sm"
              }`}>
                {msg.text.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line.includes("**") ? <strong>{line.replace(/\*\*/g, "")}</strong> :
                     line.includes("_")  ? <em>{line.replace(/_/g, "")}</em> : line}
                    {i !== arr.length - 1 && <br />}
                  </span>
                ))}
              </div>

              {/* Inline interactive for current question */}
              {msg.sender === "bot" && msg.fieldId === currentField?.id && renderInlineInteractive()}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start">
              <div className="px-4 py-3 bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 w-16 h-10">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay }}
                    className="w-1.5 h-1.5 bg-neutral-400 dark:bg-zinc-500 rounded-full" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-4 bg-white dark:bg-zinc-950 border-t border-neutral-100 dark:border-zinc-800 shrink-0 z-10 relative">
        <AnimatePresence>
          {fieldError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute -top-9 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">{fieldError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {currentFieldIndex < schema.fields.length
          ? renderBottomInput()
          : (
            <div className="flex justify-center py-1">
              {!messages.some(m => m.id === "success" || m.id === "error") ? (
                <button onClick={handleFinalSubmit} disabled={isTyping || isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#2d351e] text-white rounded-xl font-bold text-[15px] shadow-sm transition-all hover:bg-[#3a4427] hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? "Submitting…" : "Submit Answers"}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 size={20} /> Form Completed
                </div>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ─── Chat Date Picker ──────────────────────────────────────────────────────────
const C_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const C_DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function ChatDatePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
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
    <div className="w-56 select-none border border-neutral-200 rounded-xl p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prev} className="p-1 hover:bg-neutral-100 rounded text-blue-600 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="font-semibold text-xs text-neutral-700">{C_MONTHS[vm]} {vy}</span>
        <button type="button" onClick={next} className="p-1 hover:bg-neutral-100 rounded text-blue-600 transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {C_DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-neutral-400 py-0.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: dim }, (_, i) => i + 1).map(day => {
          const isSel   = selected && selected.getFullYear() === vy && selected.getMonth() === vm && selected.getDate() === day;
          const isToday = today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === day;
          return (
            <button key={day} type="button" onClick={() => pick(day)}
              className={`w-full aspect-square rounded text-[11px] font-medium transition-colors ${
                isSel   ? "bg-blue-500 text-white" :
                isToday ? "bg-blue-100 text-blue-700 font-bold" :
                          "hover:bg-neutral-100 text-neutral-700"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-center text-[10px] text-blue-600 font-semibold mt-2">
          {selected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
