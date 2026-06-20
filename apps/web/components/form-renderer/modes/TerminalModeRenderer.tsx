import React, { useState, useEffect, useRef } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion } from "framer-motion";
import { validateField } from "@formforge/form-engine";
import { FormField } from "../schema";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type TerminalLine = {
  id: string;
  type: "system" | "question" | "options" | "input" | "success" | "error";
  text: string;
  fieldId?: string;
  options?: string[];
  isMulti?: boolean;
};

export function TerminalModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTypingQuestion, setIsTypingQuestion] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Boot sequence ──────────────────────────────────────────────────────────
  useEffect(() => {
    let t: NodeJS.Timeout;
    setLines([
      { id: "b1", type: "system", text: "$ FormForge v1.0.0" },
      { id: "b2", type: "system", text: `$ Loading: ${schema.title}...` },
    ]);
    t = setTimeout(() => {
      setLines(prev => [...prev, { id: "b3", type: "system", text: "$ Ready." }]);
      setIsTypingQuestion(false);
    }, 800);
    return () => clearTimeout(t);
  }, [schema.title]);

  // ── Ask current question ───────────────────────────────────────────────────
  useEffect(() => {
    if (isTypingQuestion) return;

    if (currentFieldIndex < schema.fields.length) {
      const field = schema.fields[currentFieldIndex];
      if (!field) return;

      setLines(prev => {
        const last = prev[prev.length - 1];
        if (last?.fieldId === field.id && last.type === "question") return prev;
        if (last?.type === "options") return prev;

        const next = [...prev];
        if (prev.length > 3) next.push({ id: `sp-${field.id}`, type: "system", text: "" });

        let qText = `[Q${currentFieldIndex + 1}/${schema.fields.length}] ${field.label}`;
        if (field.required) qText += " *";
        next.push({ id: `q-${field.id}`, type: "question", text: qText, fieldId: field.id });

        if (field.description)
          next.push({ id: `desc-${field.id}`, type: "system", text: `       ${field.description}` });

        // For option-based fields show the numbered list
        if (field.options && (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown")) {
          next.push({
            id: `opt-${field.id}`, type: "options", text: "",
            options: field.options, isMulti: field.type === "checkbox", fieldId: field.id,
          });
        }
        return next;
      });
    } else if (currentFieldIndex === schema.fields.length) {
      setLines(prev => {
        if (prev.some(l => l.id === "submit-prompt")) return prev;
        return [
          ...prev,
          { id: "sp-end", type: "system", text: "" },
          { id: "submit-prompt", type: "system", text: "$ All questions answered. Type 'submit' to finish, or 'reset' to start over." },
        ];
      });
    }
  }, [currentFieldIndex, isTypingQuestion, schema.fields]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, inputValue]);

  // ── Text-command submission (end-of-form) ─────────────────────────────────
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting) return;
    const val = inputValue.trim();
    if (!val) return;
    setInputValue("");

    setLines(prev => [...prev, { id: `cmd-${Date.now()}`, type: "input", text: `> ${val}` }]);

    if (val.toLowerCase() === "submit") {
      setLines(prev => [...prev, { id: `sys-sub-${Date.now()}`, type: "system", text: "Submitting data..." }]);
      const ok = await handleSubmit();
      setLines(prev => [...prev, ok
        ? { id: "sys-success", type: "success", text: "✓ Form submitted successfully." }
        : { id: "sys-err",     type: "error",   text: "✗ Submission failed. Please try again." },
      ]);
    } else if (val.toLowerCase() === "reset") {
      setLines([{ id: "sys-reset", type: "system", text: "$ Resetting form..." }]);
      setCurrentFieldIndex(0);
    } else {
      setLines(prev => [...prev, { id: `err-${Date.now()}`, type: "error", text: "✗ Unknown command. Type 'submit' or 'reset'." }]);
    }
  };

  // ── Widget-based field advance ─────────────────────────────────────────────
  const advanceField = () => {
    const field = schema.fields[currentFieldIndex];
    if (!field) return;
    const val = values[field.id];
    const err = validateField(field, val);
    if (err) {
      setLines(prev => [...prev, { id: `err-${Date.now()}`, type: "error", text: `✗ ${err}` }]);
      return;
    }

    let successText = "✓ Noted.";
    if (field.type === "radio" || field.type === "select" || field.type === "dropdown") successText = `✓ ${val} selected.`;
    if (field.type === "checkbox") successText = `✓ Selected: ${(val as string[]).join(", ")}`;
    if (field.type === "rating") successText = `✓ Rated ${val}/5 stars.`;
    if (field.type === "date") successText = `✓ Date: ${val}`;

    setLines(prev => [
      ...prev,
      { id: `in-${field.id}-${Date.now()}`,   type: "input",   text: `> (selected)` },
      { id: `suc-${field.id}-${Date.now()}`, type: "success", text: successText },
    ]);

    setIsTypingQuestion(true);
    setTimeout(() => {
      setCurrentFieldIndex(prev => prev + 1);
      setIsTypingQuestion(false);
    }, 400);
  };

  const currentField = currentFieldIndex < schema.fields.length ? schema.fields[currentFieldIndex] : null;
  const isComplete   = currentFieldIndex >= schema.fields.length;
  const isSubmitted  = lines.some(l => l.id === "sys-success");

  return (
    <div className="w-full h-[600px] max-h-[80vh] max-w-[700px] mx-auto bg-[#0a0a0a] rounded-xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col font-mono text-[14px] leading-relaxed">
      {/* Mac-style title bar */}
      <div className="h-8 bg-[#1a1a1a] border-b border-neutral-800 flex items-center px-4 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 text-center text-xs font-semibold text-neutral-500 font-sans tracking-wider">
          bash — {schema.title}
        </div>
      </div>

      {/* Terminal body */}
      <div
        className="flex-1 overflow-y-auto p-5 text-neutral-300"
        onClick={() => document.getElementById("terminal-cmd-input")?.focus()}
      >
        <div className="flex flex-col gap-1.5">
          {/* Rendered lines */}
          {lines.map(line => {
            if (line.type === "options" && line.options) {
              return (
                <div key={line.id} className="pl-4 flex flex-col gap-1 my-1 text-neutral-400">
                  {line.options.map((opt, idx) => (
                    <div key={idx}>  [{idx + 1}] {opt}</div>
                  ))}
                  {line.isMulti
                    ? <div className="text-neutral-500 italic mt-1">type numbers separated by commas (e.g. 1,3)</div>
                    : <div className="text-neutral-500 italic mt-1">type a number</div>
                  }
                </div>
              );
            }

            const colorClass =
              line.type === "success"  ? "text-[#00ff00]" :
              line.type === "error"    ? "text-[#ff4444]" :
              line.type === "question" ? "text-white font-semibold" :
              line.type === "input"    ? "text-[#7c3aed]" :
              "text-neutral-400";

            return (
              <div key={line.id} className={`${colorClass} whitespace-pre-wrap break-words`}>
                {line.type === "question"
                  ? <TypewriterText text={line.text} speed={18} />
                  : line.text}
              </div>
            );
          })}

          {/* Active field widget */}
          {!isTypingQuestion && !isSubmitting && !isSubmitted && currentField && (
            <div className="mt-3">
              <TerminalFieldWidget
                field={currentField}
                value={values[currentField.id]}
                onChange={(v) => handleChange(currentField.id, v)}
                onAdvance={advanceField}
              />
            </div>
          )}

          {/* End-of-form command input */}
          {!isTypingQuestion && !isSubmitting && !isSubmitted && isComplete && (
            <form onSubmit={handleCommandSubmit} className="flex mt-2 w-full">
              <span className="text-[#7c3aed] mr-2 shrink-0">{">"}</span>
              <input
                id="terminal-cmd-input"
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="submit / reset"
                className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] caret-[#e2e8f0] focus:ring-0 p-0 m-0 placeholder:text-neutral-700"
              />
            </form>
          )}

          {isSubmitting && (
            <div className="mt-1 flex gap-2 text-neutral-400">
              <span>{">"}</span>
              <span className="animate-pulse">processing...</span>
            </div>
          )}
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}

// ─── Terminal Field Widget ─────────────────────────────────────────────────────
// Renders field-type-aware interactive UI inside the dark terminal canvas.
function TerminalFieldWidget({
  field, value, onChange, onAdvance,
}: {
  field: FormField;
  value: any;
  onChange: (v: any) => void;
  onAdvance: () => void;
}) {
  const inputCls = "flex-1 bg-transparent border-none outline-none text-[#e2e8f0] caret-[#e2e8f0] focus:ring-0 p-0 m-0 placeholder:text-neutral-600";
  const nextBtn  = (
    <button
      type="button"
      onClick={onAdvance}
      className="ml-3 px-3 py-1 bg-[#7c3aed] text-white rounded text-xs font-bold hover:bg-violet-500 transition-colors shrink-0"
    >
      Next →
    </button>
  );

  // ── Short text / text / name / email / number / phone ──
  if (["text","short_text","name","email","number","phone","tel"].includes(field.type)) {
    return (
      <form className="flex items-center" onSubmit={e => { e.preventDefault(); onAdvance(); }}>
        <span className="text-[#7c3aed] mr-2">{">"}</span>
        <input
          autoFocus
          type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || "Type your answer…"}
          className={inputCls}
        />
        {nextBtn}
      </form>
    );
  }

  // ── Long text / textarea ───────────────────────────────
  if (["textarea","long_text"].includes(field.type)) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex">
          <span className="text-[#7c3aed] mr-2 mt-1">{">"}</span>
          <textarea
            autoFocus
            rows={3}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || "Type your answer… (Shift+Enter for new line)"}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAdvance(); } }}
            className="flex-1 bg-transparent border border-neutral-700 rounded p-2 text-[#e2e8f0] placeholder:text-neutral-600 outline-none focus:border-[#7c3aed] resize-none"
          />
        </div>
        <div className="flex justify-end">{nextBtn}</div>
      </div>
    );
  }

  // ── Date picker ────────────────────────────────────────
  if (field.type === "date") {
    return (
      <div className="flex flex-col gap-2">
        <TerminalDatePicker value={value} onChange={onChange} />
        <div className="flex justify-end">{nextBtn}</div>
      </div>
    );
  }

  // ── Checkbox ───────────────────────────────────────────
  if (field.type === "checkbox" && field.options) {
    const selected: string[] = Array.isArray(value) ? value : [];
    const toggle = (opt: string) =>
      onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt]);

    return (
      <div className="flex flex-col gap-2 pl-4">
        <div className="text-neutral-500 text-xs mb-1 italic">Toggle options, then press Next:</div>
        {field.options.map((opt, i) => {
          const checked = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded text-sm transition-colors text-left ${
                checked ? "text-[#00ff00] border border-[#00ff00]/30 bg-[#00ff00]/5" : "text-neutral-400 border border-neutral-800 hover:border-neutral-600"
              }`}>
              <span className={`w-4 h-4 rounded flex items-center justify-center border ${checked ? "bg-[#00ff00] border-[#00ff00]" : "border-neutral-600"}`}>
                {checked && <Check size={10} className="text-black" />}
              </span>
              [{i + 1}] {opt}
            </button>
          );
        })}
        <div className="flex justify-end mt-1">{nextBtn}</div>
      </div>
    );
  }

  // ── Radio / Select / Dropdown ──────────────────────────
  if ((field.type === "radio" || field.type === "select" || field.type === "dropdown") && field.options) {
    return (
      <div className="flex flex-col gap-1 pl-4">
        <div className="text-neutral-500 text-xs mb-1 italic">Select one option:</div>
        {field.options.map((opt, i) => {
          const isSelected = value === opt;
          return (
            <button key={opt} type="button" onClick={() => { onChange(opt); setTimeout(onAdvance, 250); }}
              className={`flex items-center gap-3 px-3 py-1.5 rounded text-sm transition-colors text-left ${
                isSelected ? "text-[#7c3aed] border border-[#7c3aed]/50 bg-[#7c3aed]/10" : "text-neutral-400 border border-neutral-800 hover:border-neutral-600"
              }`}>
              <span className="text-neutral-500">[{i + 1}]</span> {opt}
              {isSelected && <span className="ml-auto text-[#7c3aed] text-xs">✓ selected</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Rating ─────────────────────────────────────────────
  if (field.type === "rating") {
    const rating = typeof value === "number" ? value : 0;
    return (
      <div className="flex flex-col gap-2 pl-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button key={r} type="button" onClick={() => onChange(r)}
              className={`text-3xl transition-all ${
                r <= rating ? "text-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" : "text-neutral-700 hover:text-amber-300"
              }`}>
              ★
            </button>
          ))}
          {rating > 0 && <span className="text-neutral-500 text-xs ml-2">{rating}/5 stars</span>}
        </div>
        {rating > 0 && <div className="flex justify-end">{nextBtn}</div>}
      </div>
    );
  }

  return (
    <div className="text-neutral-500 text-xs italic pl-4">
      Field type "{field.type}" is not yet supported in terminal mode.
    </div>
  );
}

// ─── Terminal Date Picker ──────────────────────────────────────────────────────
const T_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const T_DAYS   = ["S","M","T","W","T","F","S"];

function TerminalDatePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
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
    <div className="w-56 select-none border border-neutral-700 rounded-lg p-3 bg-[#111] ml-4">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prev} className="text-neutral-400 hover:text-white px-1">‹</button>
        <span className="text-neutral-300 text-xs font-semibold">{T_MONTHS[vm]} {vy}</span>
        <button type="button" onClick={next} className="text-neutral-400 hover:text-white px-1">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {T_DAYS.map((d, i) => <div key={i} className="text-center text-[9px] text-neutral-600 py-0.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: dim }, (_, i) => i + 1).map(day => {
          const isSel   = selected && selected.getFullYear() === vy && selected.getMonth() === vm && selected.getDate() === day;
          const isToday = today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === day;
          return (
            <button key={day} type="button" onClick={() => pick(day)}
              className={`w-full aspect-square rounded text-[11px] font-medium transition-colors ${
                isSel   ? "bg-[#7c3aed] text-white" :
                isToday ? "bg-neutral-700 text-white" :
                          "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-center text-[10px] text-[#7c3aed] font-semibold mt-2">
          {selected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      )}
    </div>
  );
}

// ─── Typewriter Text ───────────────────────────────────────────────────────────
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}
