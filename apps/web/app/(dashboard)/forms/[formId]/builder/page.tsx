"use client";

import React from "react";
import { Check } from "lucide-react";
import { FieldPalette } from "@/components/builder/field-palette";
import { FieldSettings } from "@/components/builder/field-settings";
import { FieldCard, EmptySlot } from "@/components/builder/field-card";

export default function FormBuilderPage({ params }: { params: { formId: string } }) {
  // We don't break out of the layout.
  // The layout gives us px-6 pt-24 pb-6.
  // We want the panels to float and be vertically centered (my-auto).
  
  return (
    <div className="-mt-4 flex flex-1 gap-6 items-center w-full" style={{ height: "calc(100vh - 100px)" }}>
      {/* Subtle grain texture overlay for the whole builder area */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          backgroundRepeat: "repeat",
        }}
      />

      {/* 1. Left Panel (Field Palette) */}
      <div className="w-[260px] h-full max-h-[85vh] bg-white rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 shrink-0 z-10 flex flex-col overflow-hidden">
        <FieldPalette />
      </div>

      {/* 2. Center Canvas */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-[896px] bg-white min-h-[700px] rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 p-8 flex flex-col my-auto gap-4">
            {/* Visual flow layout as requested */}
            
            {/* Full width field */}
            <FieldCard 
              type="short_text" 
              label="Full Name" 
              placeholder="e.g. Jane Doe" 
              required 
              helpText="Please enter your full legal name" 
            />

            {/* Row of half-width fields */}
            <div className="flex items-start justify-between w-full">
              <FieldCard 
                type="short_text" 
                label="First Name" 
                width="half" 
              />
              <EmptySlot />
            </div>

            {/* Selected Full width field */}
            <FieldCard 
              type="email" 
              label="Email Address" 
              state="selected" 
            />

            {/* Add Section Button Placeholder */}
            <div className="mt-8 flex items-center justify-center">
              <button className="px-4 py-2 text-xs font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-700 rounded-lg transition-colors border border-neutral-200 border-dashed">
                + Add Section
              </button>
            </div>
          </div>
      </div>

      {/* 3. Right Panel (Field Settings) */}
      <div className="w-[320px] h-full max-h-[85vh] bg-white rounded-2xl shadow-lg shadow-neutral-200/40 border border-neutral-200 shrink-0 z-10 flex flex-col overflow-hidden">
        <FieldSettings />
      </div>
    </div>
  );
}
