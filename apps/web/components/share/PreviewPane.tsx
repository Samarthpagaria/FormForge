import React from "react";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";

interface PreviewPaneProps {
  device: "desktop" | "tablet" | "mobile";
  schema: any;
  displayMode: string;
  formUrl: string;
}

export function PreviewPane({ device, schema, displayMode, formUrl }: PreviewPaneProps) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-hidden relative min-h-0">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-neutral-50 p-4 sm:p-8">
        <div className={`transition-all duration-300 w-full relative flex flex-col bg-white overflow-hidden shadow-2xl min-h-0 shrink-0 ${
        device === "mobile" 
          ? "max-w-[375px] h-full max-h-[812px] rounded-[3rem] border-[8px] border-neutral-900" 
          : device === "tablet"
            ? "max-w-[768px] h-full max-h-[800px] rounded-3xl border-[12px] border-neutral-900"
            : "max-w-[1280px] h-full max-h-[800px] rounded-xl border-[4px] border-neutral-900"
      }`}>
        
        {/* Browser Chrome */}
        {device !== "mobile" && (
          <div className="h-12 bg-neutral-100 border-b border-neutral-200 flex items-center px-4 shrink-0 gap-2 w-full relative z-10">
            <div className="flex items-center gap-1.5 z-10">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white border border-neutral-200/60 rounded-md h-7 w-1/2 max-w-[300px] flex items-center px-3 justify-center text-[10px] text-neutral-400 font-mono truncate shadow-sm">
                {formUrl.replace(/^https?:\/\//, '')}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Notch */}
        {device === "mobile" && (
          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-900 rounded-b-2xl w-[140px] mx-auto z-50 flex items-center justify-center">
            <div className="w-12 h-1.5 bg-neutral-800 rounded-full"></div>
          </div>
        )}

        {/* Form Container */}
        <div className={`flex-1 w-full overflow-y-auto custom-scrollbar relative z-0 ${displayMode !== "normal" ? 'bg-white' : 'bg-[#f5f5f3]'}`}>
          <div className={`w-full ${device === "mobile" ? "pt-12 pb-8 px-4" : "py-8 px-4 sm:px-8"}`}>
            {displayMode !== "normal" ? (
              <FormRenderer schema={schema} mode={displayMode as any} disabled={true} forceMobile={device === "mobile"} />
            ) : (
              <div className={`w-full ${device === "mobile" ? "max-w-full" : "max-w-[800px] mx-auto"} bg-white rounded-2xl shadow-sm border border-neutral-200/50 p-6 sm:p-10`}>
                <FormRenderer schema={schema} mode={displayMode as any} disabled={true} forceMobile={device === "mobile"} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
