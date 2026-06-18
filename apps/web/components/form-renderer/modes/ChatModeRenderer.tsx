import React, { useState, useEffect, useRef } from "react";
import { ModeRendererProps } from "./NormalModeRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, CheckCircle2 } from "lucide-react";
import { FormField } from "../schema";
import { validateField } from "@formforge/form-engine";

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
  type?: "text" | "interactive";
  fieldId?: string; // which field is this related to?
};

export function ChatModeRenderer({ schema, disabled = false, engine }: ModeRendererProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = engine;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro-title", sender: "bot", text: `Hi there! Let's get started with: **${schema.title}**` },
  ]);
  
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  // For multi-select inputs inline
  const [tempSelection, setTempSelection] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add description if exists and it's the very beginning
    if (schema.description && messages.length === 1 && currentFieldIndex === 0 && !isTyping) {
      setMessages(prev => [...prev, { id: "intro-desc", sender: "bot", text: schema.description! }]);
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, fieldError]);

  // Handle advancing to the next question
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const askNextQuestion = () => {
      if (currentFieldIndex < schema.fields.length) {
        setIsTyping(true);
        timeoutId = setTimeout(() => {
          const nextField = schema.fields[currentFieldIndex];
          if (!nextField) return;
          let qText = nextField.label;
          if (nextField.required) qText += " *";
          if (nextField.description) qText += `\n\n_${nextField.description}_`;

          setMessages(prev => [...prev, { id: `q-${nextField.id}`, sender: "bot", text: qText, type: "text", fieldId: nextField.id }]);
          
          setIsTyping(false);
          setInputValue("");
          setFieldError(null);
          
          // Reset temp selection for checkboxes
          if (nextField.type === "checkbox") {
            setTempSelection(values[nextField.id] || []);
          }
        }, 800);
      } else if (currentFieldIndex === schema.fields.length) {
        // Form is complete
        setIsTyping(true);
        timeoutId = setTimeout(() => {
          setMessages(prev => [...prev, { id: "outro", sender: "bot", text: "Great! That's all the questions. Ready to submit?" }]);
          setIsTyping(false);
        }, 800);
      }
    };

    // Trigger asking the next question if the last message was from the user or intro
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && (lastMessage.sender === "user" || lastMessage.id === "intro-title" || lastMessage.id === "intro-desc")) {
       // but only if we are not already waiting
       askNextQuestion();
    }

    return () => clearTimeout(timeoutId);
  }, [currentFieldIndex, messages.length]);


  const handleUserSubmit = (overrideVal?: any, displayVal?: string) => {
    if (currentFieldIndex >= schema.fields.length) return;
    
    const currentField = schema.fields[currentFieldIndex];
    if (!currentField) return;
    const val = overrideVal !== undefined ? overrideVal : inputValue;
    
    // Validate
    const error = validateField(currentField, val);
    if (error) {
      setFieldError(error);
      return;
    }

    // Save state
    handleChange(currentField.id, val);

    // Add user message
    let display = displayVal !== undefined ? displayVal : (val as string);
    if (Array.isArray(val)) {
      display = val.join(", ");
    }
    
    setMessages(prev => [...prev, { id: `a-${currentField.id}`, sender: "user", text: display }]);
    setCurrentFieldIndex(prev => prev + 1);
  };

  const handleFinalSubmit = async () => {
    setMessages(prev => [...prev, { id: "submit-action", sender: "user", text: "Submit Form" }]);
    setIsTyping(true);
    const success = await handleSubmit();
    setIsTyping(false);
    
    if (success) {
      setMessages(prev => [...prev, { id: "success", sender: "bot", text: "🎉 Successfully submitted! Thank you!" }]);
    } else {
      setMessages(prev => [...prev, { id: "error", sender: "bot", text: "❌ Oops, there was an error submitting." }]);
    }
  };

  const currentField = currentFieldIndex < schema.fields.length ? schema.fields[currentFieldIndex] : null;

  // Determine what interactive UI to show inline or at bottom
  const renderInlineInteractive = () => {
    if (isTyping || !currentField) return null;
    // Only show if the latest message is the question for this field
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.sender !== "bot" || lastMessage.fieldId !== currentField.id) return null;

    if ((currentField.type === "radio" || currentField.type === "select") && currentField.options) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
          {currentField.options.map(opt => (
            <button
              key={opt}
              onClick={() => handleUserSubmit(opt, opt)}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              {opt}
            </button>
          ))}
        </motion.div>
      );
    }

    if (currentField.type === "checkbox" && currentField.options) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-2 max-w-[85%]">
          <div className="flex flex-wrap gap-2">
            {currentField.options.map(opt => {
              const isSelected = tempSelection.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    setTempSelection(prev => 
                      isSelected ? prev.filter(p => p !== opt) : [...prev, opt]
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95 border ${
                    isSelected 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-blue-300 hover:bg-neutral-50"
                  }`}
                >
                  {isSelected && <Check size={14} />}
                  {opt}
                </button>
              )
            })}
          </div>
          <button 
            onClick={() => handleUserSubmit(tempSelection)}
            className="self-start px-5 py-2 bg-neutral-900 text-white rounded-full text-sm font-semibold shadow-md hover:bg-neutral-800 transition-all flex items-center gap-2 active:scale-95"
          >
            Confirm Selection <Send size={14} />
          </button>
        </motion.div>
      );
    }

    if (currentField.type === "rating") {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => handleUserSubmit(rating, `${rating} Stars`)}
              className="w-10 h-10 flex items-center justify-center bg-white text-yellow-500 border border-neutral-200 hover:bg-yellow-50 hover:border-yellow-300 rounded-full text-lg transition-all shadow-sm active:scale-95"
            >
              ★
            </button>
          ))}
        </motion.div>
      );
    }

    return null;
  };

  const isTextInput = currentField?.type === "text" || currentField?.type === "email" || currentField?.type === "number" || currentField?.type === "phone" || currentField?.type === "textarea" || currentField?.type === "date" || currentField?.type === "file";

  return (
    <div className="flex flex-col w-full h-[600px] max-h-[80vh] max-w-[500px] mx-auto bg-white rounded-3xl shadow-xl border border-neutral-200/60 overflow-hidden relative">
      
      {/* Moving Background Gradient within Chat */}
      <div className="absolute inset-0 z-0 opacity-60 mix-blend-multiply overflow-hidden pointer-events-none bg-[#f8f9fa]">
        <div className="absolute -top-[20%] -left-[10%] w-[300px] h-[300px] bg-blue-100 rounded-full blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] -right-[20%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 bg-white/90 backdrop-blur-md z-10 flex items-center gap-3 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-neutral-800 truncate" title={schema.title}>{schema.title || "Untitled Form"}</h2>
          {schema.description ? (
            <div className="group relative w-full">
              <p className="text-[11px] text-neutral-500 font-medium truncate cursor-pointer pr-4">
                {schema.description}
              </p>
              <div className="hidden group-hover:block absolute top-full left-0 mt-1 p-3 bg-white border border-neutral-200 shadow-xl rounded-xl z-50 w-[280px] text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {schema.description}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
              </span>
              Online
            </p>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 z-10 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                msg.sender === "user" 
                  ? "bg-blue-500 text-white rounded-br-sm" 
                  : "bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm"
              }`}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.includes('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : 
                     line.includes('_') ? <em>{line.replace(/_/g, '')}</em> : line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              
              {msg.sender === "bot" && msg.fieldId === currentField?.id && renderInlineInteractive()}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-start"
            >
              <div className="px-4 py-3 bg-white border border-neutral-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 w-16 h-10">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-neutral-100 shrink-0 z-10 relative">
        <AnimatePresence>
          {fieldError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">{fieldError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {currentFieldIndex < schema.fields.length ? (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleUserSubmit(); }}
            className={`flex items-end gap-2 bg-neutral-50 border rounded-2xl p-1 transition-colors ${fieldError ? 'border-red-300' : 'border-neutral-200 focus-within:border-blue-300 focus-within:bg-white'}`}
          >
            <input
              type={currentField?.type === "email" ? "email" : currentField?.type === "number" ? "number" : currentField?.type === "date" ? "date" : currentField?.type === "file" ? "file" : "text"}
              placeholder={isTextInput ? currentField?.placeholder || "Type your answer..." : "Please select an option above..."}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); if(fieldError) setFieldError(null); }}
              disabled={!isTextInput || isTyping}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isTextInput || !inputValue.trim() || isTyping}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-xl mb-0.5 mr-0.5 hover:bg-blue-700 disabled:opacity-50 disabled:bg-neutral-300 transition-colors shadow-sm"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        ) : (
          <div className="flex justify-center pt-2 pb-2">
            {!messages.some(m => m.id === "success" || m.id === "error") ? (
              <button
                onClick={handleFinalSubmit}
                disabled={isTyping || isSubmitting}
                className="w-full py-3.5 px-4 bg-[#2d351e] text-white rounded-xl font-bold text-[15px] shadow-sm transition-all hover:bg-[#3a4427] hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Answers"}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 size={20} /> Form Completed
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
