import React, { useState, useEffect, useRef } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { validateField } from "@formforge/form-engine";

type TerminalLine = {
  id: string;
  type: "system" | "question" | "options" | "input" | "success" | "error";
  text: string;
  fieldId?: string;
  options?: string[]; // for radio/checkbox
  isMulti?: boolean;
};

export function TerminalModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTypingQuestion, setIsTypingQuestion] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Boot sequence
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const boot = async () => {
      setLines([
        { id: "b1", type: "system", text: "$ FormForge v1.0.0" },
        { id: "b2", type: "system", text: `$ Loading: ${schema.title}...` },
      ]);
      
      timeoutId = setTimeout(() => {
        setLines(prev => [...prev, { id: "b3", type: "system", text: "$ Ready." }]);
        setIsTypingQuestion(false);
      }, 1000);
    };

    boot();
    return () => clearTimeout(timeoutId);
  }, [schema.title]);

  // Ask current question
  useEffect(() => {
    if (isTypingQuestion) return;
    
    let timeoutId: NodeJS.Timeout;

    if (currentFieldIndex < schema.fields.length) {
      const field = schema.fields[currentFieldIndex];
      if (!field) return;
      // Only add question if it's not already the last line
      setLines(prev => {
        const last = prev[prev.length - 1];
        if (last && last.fieldId === field.id && last.type === "question") return prev;
        if (last && last.type === "options") return prev; // already showing options
        
        const newLines = [...prev];
        // Add empty line for spacing
        if (prev.length > 3) newLines.push({ id: `space-${field.id}`, type: "system", text: "" });
        
        let qText = `[Q${currentFieldIndex + 1}/${schema.fields.length}] ${field.label}`;
        if (field.required) qText += " *";
        newLines.push({ id: `q-${field.id}`, type: "question", text: qText, fieldId: field.id });
        
        if (field.description) {
          newLines.push({ id: `desc-${field.id}`, type: "system", text: `       ${field.description}` });
        }

        if (field.options && (field.type === "radio" || field.type === "checkbox" || field.type === "dropdown")) {
          newLines.push({ 
            id: `opt-${field.id}`, 
            type: "options", 
            text: "", 
            options: field.options,
            isMulti: field.type === "checkbox",
            fieldId: field.id
          });
        }
        
        return newLines;
      });
    } else if (currentFieldIndex === schema.fields.length) {
      setLines(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id === "submit-prompt") return prev;
        return [
          ...prev, 
          { id: "space-end", type: "system", text: "" },
          { id: "submit-prompt", type: "system", text: "$ All questions answered. Type 'submit' to finish, or 'reset' to start over." }
        ];
      });
    }

  }, [currentFieldIndex, isTypingQuestion, schema.fields]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, inputValue]);

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting) return;

    const val = inputValue.trim();
    if (!val) return;
    setInputValue("");

    // Handle end-of-form commands
    if (currentFieldIndex >= schema.fields.length) {
      if (val.toLowerCase() === "submit") {
        setLines(prev => [...prev, { id: `cmd-sub-${Date.now()}`, type: "input", text: `> ${val}` }]);
        
        setLines(prev => [...prev, { id: `sys-subbing-${Date.now()}`, type: "system", text: "Submitting data..." }]);
        
        const success = await handleSubmit();
        if (success) {
          setLines(prev => [...prev, { id: "sys-success", type: "success", text: "✓ Form submitted successfully." }]);
        } else {
          setLines(prev => [...prev, { id: "sys-err", type: "error", text: "x Submission failed." }]);
        }
      } else if (val.toLowerCase() === "reset") {
        setLines([{ id: "sys-reset", type: "system", text: "$ Resetting form..." }]);
        setCurrentFieldIndex(0);
      } else {
        setLines(prev => [...prev, 
          { id: `cmd-${Date.now()}`, type: "input", text: `> ${val}` },
          { id: `err-${Date.now()}`, type: "error", text: "x Unknown command. Type 'submit' or 'reset'." }
        ]);
      }
      return;
    }

    const currentField = schema.fields[currentFieldIndex];
    if (!currentField) return;
    
    // Add user input to terminal
    setLines(prev => [...prev, { id: `in-${currentField.id}-${Date.now()}`, type: "input", text: `> ${val}` }]);

    let parsedVal: any = val;

    // Parse options if radio/checkbox
    if (currentField.options && (currentField.type === "radio" || currentField.type === "checkbox")) {
      if (currentField.type === "radio") {
        const idx = parseInt(val) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < currentField.options.length) {
          parsedVal = currentField.options[idx];
        } else {
          // Check if they typed the text exactly
          const exact = currentField.options.find(o => o.toLowerCase() === val.toLowerCase());
          if (exact) parsedVal = exact;
        }
      } else if (currentField.type === "checkbox") {
        const parts = val.split(",").map(p => p.trim());
        const selected: string[] = [];
        let valid = true;
        for (const p of parts) {
          const idx = parseInt(p) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < currentField.options.length) {
            const opt = currentField.options[idx];
            if (opt) selected.push(opt);
          } else {
            const exact = currentField.options.find(o => o.toLowerCase() === p.toLowerCase());
            if (exact) {
              selected.push(exact);
            } else {
              valid = false;
            }
          }
        }
        if (valid && selected.length > 0) {
          parsedVal = selected;
        } else {
          parsedVal = null; // force error
        }
      }
    }

    if (!currentField) return;

    // Validate
    const error = validateField(currentField, parsedVal);
    if (error) {
      setLines(prev => [...prev, { id: `err-${currentField.id}-${Date.now()}`, type: "error", text: `x ${error}` }]);
      return;
    }

    // Valid
    handleChange(currentField.id, parsedVal);
    
    let successText = "✓ Noted.";
    if (currentField.type === "radio") successText = `✓ ${parsedVal} selected.`;
    if (currentField.type === "checkbox") successText = `✓ Selected: ${parsedVal.join(", ")}`;
    
    setLines(prev => [...prev, { id: `succ-${currentField.id}-${Date.now()}`, type: "success", text: successText }]);
    
    // Advance
    setIsTypingQuestion(true);
    setTimeout(() => {
      setCurrentFieldIndex(prev => prev + 1);
      setIsTypingQuestion(false);
    }, 400);
  };

  return (
    <div className="w-full h-[600px] max-h-[80vh] max-w-[700px] mx-auto bg-[#0a0a0a] rounded-xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col font-mono text-[14px] leading-relaxed overflow-x-hidden">
      
      {/* Mac Terminal Header */}
      <div className="h-8 bg-[#1a1a1a] border-b border-neutral-800 flex items-center px-4 shrink-0 overflow-hidden">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 text-center text-xs font-semibold text-neutral-500 font-sans tracking-wider">
          bash — {schema.title}
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        className="flex-1 overflow-y-auto p-5 text-neutral-300"
        onClick={() => document.getElementById("terminal-input")?.focus()}
      >
        <div className="flex flex-col gap-1.5">
          {lines.map(line => {
            if (line.type === "options" && line.options) {
              return (
                <div key={line.id} className="pl-4 flex flex-col gap-1 my-1 text-neutral-400">
                  {line.options.map((opt, idx) => (
                    <div key={idx}>  [{idx + 1}] {opt}</div>
                  ))}
                  {line.isMulti ? (
                    <div className="text-neutral-500 italic mt-1">type numbers separated by comma (e.g. 1,3)</div>
                  ) : (
                    <div className="text-neutral-500 italic mt-1">type number</div>
                  )}
                </div>
              );
            }

            let colorClass = "text-neutral-300";
            if (line.type === "success") colorClass = "text-[#00ff00]";
            if (line.type === "error") colorClass = "text-[#ff0000]";
            if (line.type === "question") colorClass = "text-white font-semibold";
            if (line.type === "input") colorClass = "text-[#7c3aed]";

            return (
              <div key={line.id} className={`${colorClass} whitespace-pre-wrap break-words`}>
                {line.type === "question" ? (
                  <TypewriterText text={line.text} speed={20} />
                ) : (
                  line.text
                )}
              </div>
            );
          })}

          {/* Active Input Line */}
          {!isTypingQuestion && !isSubmitting && !lines.some(l => l.id === "sys-success") && (
            <form onSubmit={handleInputSubmit} className="flex mt-1 w-full relative">
              <span className="text-[#7c3aed] mr-2 shrink-0">{">"}</span>
              <input
                id="terminal-input"
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] caret-[#e2e8f0] focus:ring-0 p-0 m-0 w-full min-w-0"
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

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
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
