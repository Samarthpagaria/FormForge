import React from "react";
import { 
  Type, 
  Trash2, 
  Copy, 
  Settings2,
  List,
  Columns
} from "lucide-react";
import { useFormBuilderStore } from "@/stores/useFormBuilderStore";

export function FieldSettings() {
  const { fields, activeElementId, setActiveField, updateFieldProps, removeField } = useFormBuilderStore();
  
  const activeField = fields.find(f => f.id === activeElementId);

  if (!activeField) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
        <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 rounded-full flex items-center justify-center mb-3">
          <Settings2 size={20} className="text-neutral-300" />
        </div>
        <p className="text-sm font-medium text-neutral-600">No field selected</p>
        <p className="text-xs mt-1">Select a field on the canvas to edit its settings</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* ── Header ── */}
      <div className="p-4 border-b border-neutral-200/60 sticky top-0 bg-white z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-neutral-100 text-neutral-900 rounded flex items-center justify-center">
            <Type size={13} strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 capitalize">
            {activeField.type.replace('_', ' ')}
          </h2>
        </div>
        <button 
          onClick={() => setActiveField(null)}
          className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Deselect
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6">
        
        {/* ── Basic Settings ── */}
        <section className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Field Label
            </label>
            <input 
              type="text" 
              value={activeField.label}
              onChange={(e) => updateFieldProps(activeField.id, { label: e.target.value })}
              className="w-full text-sm text-neutral-900 placeholder-neutral-300 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Placeholder
            </label>
            <input 
              type="text" 
              value={activeField.placeholder || ''}
              onChange={(e) => updateFieldProps(activeField.id, { placeholder: e.target.value })}
              className="w-full text-sm text-neutral-900 placeholder-neutral-300 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all shadow-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-800">
                Help Text
              </label>
            </div>
            <input 
              type="text" 
              value={activeField.helpText || ''}
              onChange={(e) => updateFieldProps(activeField.id, { helpText: e.target.value })}
              placeholder="Add description or instruction..."
              className="w-full text-sm text-neutral-900 placeholder-neutral-300 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-neutral-800">
                Required
              </label>
              <span className="text-[11px] text-neutral-500">Prevent form submission if empty</span>
            </div>
            <div 
              onClick={() => updateFieldProps(activeField.id, { required: !activeField.required })}
              className={`w-8 h-5 rounded-full flex items-center p-0.5 cursor-pointer shadow-inner transition-colors ${activeField.required ? 'bg-neutral-900' : 'bg-neutral-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeField.required ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </div>
        </section>

        <div className="h-px bg-neutral-200/60 w-full" />

        {/* ── Validation Placeholder ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Check size={14} /> Validation
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Min Length</label>
              <input type="number" placeholder="0" className="w-full text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Max Length</label>
              <input type="number" placeholder="255" className="w-full text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all shadow-sm" />
            </div>
          </div>
        </section>

        <div className="h-px bg-neutral-200/60 w-full" />

        {/* ── Appearance ── */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Columns size={14} /> Appearance
          </h3>

          <div className="flex flex-col gap-3">
            <label className="block text-xs font-semibold text-neutral-800">Field Width</label>
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg">
              <button 
                onClick={() => updateFieldProps(activeField.id, { width: 'full' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded shadow-sm transition-colors ${activeField.width === 'full' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Full Width
              </button>
              <button 
                onClick={() => updateFieldProps(activeField.id, { width: 'half' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded shadow-sm transition-colors ${activeField.width === 'half' ? 'bg-white text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Half Width
              </button>
            </div>
          </div>
        </section>

        <div className="h-px bg-neutral-200/60 w-full" />

        {/* ── Conditional Logic ── */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <List size={14} /> Logic
          </h3>
          <button className="w-full border border-dashed border-neutral-300 rounded-lg p-3 text-xs font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-400 transition-colors flex items-center justify-center gap-2">
            + Add conditional rule
          </button>
        </section>
        
      </div>

      {/* ── Bottom Actions ── */}
      <div className="mt-auto p-4 border-t border-neutral-200/60 bg-neutral-50/50 flex flex-col gap-2">
        <button className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors">
          <Copy size={14} />
          Duplicate Field
        </button>
        <button 
          onClick={() => removeField(activeField.id)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-colors"
        >
          <Trash2 size={14} />
          Delete Field
        </button>
      </div>

    </div>
  );
}

// Just a local Check icon wrapper since it wasn't imported from lucide-react above
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
