import React from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Tablet, Smartphone } from "lucide-react";

interface SharePageHeaderProps {
  formId: string;
  formName?: string;
  loadingForm: boolean;
  device: "desktop" | "tablet" | "mobile";
  setDevice: (device: "desktop" | "tablet" | "mobile") => void;
}

export function SharePageHeader({ formId, formName, loadingForm, device, setDevice }: SharePageHeaderProps) {
  return (
    <div className="bg-[#18181b] text-white rounded-2xl border border-neutral-800 shadow-sm shadow-neutral-900/40 w-full shrink-0 min-h-[60px] py-2.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link href={`/forms/${formId}`} className="shrink-0">
          <button className="p-2 bg-neutral-800 rounded-full border border-neutral-700 text-neutral-300 hover:text-white transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Live Preview</p>
          <h2 className="text-sm font-semibold text-white truncate">
            {loadingForm ? <span className="animate-pulse bg-neutral-700 rounded w-24 h-4 block" /> : formName}
          </h2>
        </div>
      </div>

      <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-xl p-1 shadow-sm shrink-0">
        {[
          { id: "desktop", icon: Monitor, label: "Desktop" },
          { id: "tablet", icon: Tablet, label: "Tablet" },
          { id: "mobile", icon: Smartphone, label: "Mobile" }
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setDevice(d.id as any)}
            className={`flex items-center justify-center p-2 rounded-lg transition-all ${device === d.id ? "bg-neutral-700 text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50"}`}
            title={d.label}
          >
            <d.icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
