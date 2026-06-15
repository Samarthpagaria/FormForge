import React from "react";

export default function PublicFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col font-sans">
      {/* FormForge minimal top bar (optional branding) */}
      <div className="flex items-center justify-center p-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#5b21b6] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-black">FF</span>
          </div>
          <span className="text-sm font-bold text-neutral-800 tracking-tight">FormForge</span>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-12 flex flex-col relative z-10">
        {children}
      </main>
      
      {/* Minimal Footer */}
      <footer className="py-8 text-center shrink-0">
        <a href="https://formforge.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 transition-colors">
          Powered by <span className="text-neutral-800">FormForge</span>
        </a>
      </footer>
    </div>
  );
}
