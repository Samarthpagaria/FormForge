import React from "react";
import Link from "next/link";
import { Loader2, Lock, Globe, Copy, CheckCircle2, Smartphone, Download, Code, Clock, Settings, Layout } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface SharePanelProps {
  formId: string;
  form: any;
  loadingForm: boolean;
  isPublished: boolean;
  shareLink: any;
  loadingLink: boolean;
  qrData: any;
  loadingQr: boolean;
  formUrl: string;
  embedCode: string;
  togglePublish: () => void;
  isPublishing: boolean;
  isUnpublishing: boolean;
  handleCopyLink: () => void;
  copiedLink: boolean;
  handleCopyEmbed: () => void;
  copiedEmbed: boolean;
  handleDownloadQR: (format: "png" | "svg") => void;
  scheduleState: { activateAt: string; deactivateAt: string; isActive: boolean };
  setScheduleState: React.Dispatch<React.SetStateAction<{ activateAt: string; deactivateAt: string; isActive: boolean }>>;
  setSchedule: (opts: any) => void;
  isSavingSchedule: boolean;
  settings: Record<string, any>;
  updateSettings: (opts: any) => void;
  allowMultiple: boolean;
  displayMode: string;
}

export function SharePanel({
  formId, form, loadingForm, isPublished, shareLink, loadingLink, qrData, loadingQr, formUrl, embedCode,
  togglePublish, isPublishing, isUnpublishing, handleCopyLink, copiedLink, handleCopyEmbed, copiedEmbed,
  handleDownloadQR, scheduleState, setScheduleState, setSchedule, isSavingSchedule,
  settings, updateSettings, allowMultiple, displayMode
}: SharePanelProps) {
  return (
    <div className="w-full lg:w-[380px] flex-1 lg:flex-none min-h-0 bg-white rounded-2xl border border-neutral-200 shadow-sm shadow-neutral-200/40 flex flex-col overflow-y-auto custom-scrollbar z-10 relative">
      {loadingForm && (
         <div className="absolute inset-0 bg-white/80 backdrop-blur z-50 flex items-center justify-center">
           <Loader2 className="animate-spin text-neutral-400" />
         </div>
      )}

      <div className="p-6 border-b border-neutral-100">
        <h2 className="text-lg font-black text-neutral-900 tracking-tight">Share this form</h2>
        <p className="text-sm text-neutral-500 font-medium truncate mt-0.5">{form?.name}</p>
        
        <div className="mt-4 flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-neutral-400"}`} />
            <span className="text-sm font-semibold text-neutral-700">Status: {isPublished ? "Published" : "Draft"}</span>
          </div>
          <button 
            onClick={togglePublish}
            disabled={isPublishing || isUnpublishing}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 ${isPublished ? "text-neutral-600 hover:bg-neutral-200/50" : "bg-violet-600 text-white hover:bg-violet-700"}`}
          >
            {(isPublishing || isUnpublishing) && <Loader2 size={12} className="animate-spin" />}
            {isPublished ? "Unpublish" : "Publish Form"}
          </button>
        </div>
        
        {!isPublished && (
          <p className="text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded-lg mt-2 flex items-center gap-1.5 border border-amber-100">
            <Lock size={12} /> Publish this form to share it with the world.
          </p>
        )}
      </div>

      <div className={`flex flex-col p-6 gap-8 ${!isPublished ? "opacity-50 pointer-events-none grayscale-[0.5]" : ""}`}>
        {/* Public Link */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Globe size={16} className="text-neutral-400" /> Public Link
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 flex items-center overflow-hidden h-[42px]">
              {loadingLink && isPublished ? (
                <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
              ) : (
                <span className="text-sm font-medium text-neutral-600 truncate">{formUrl}</span>
              )}
            </div>
            <button 
              onClick={handleCopyLink}
              disabled={(loadingLink && isPublished) || !isPublished}
              className="shrink-0 p-2.5 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 text-neutral-500 transition-colors relative"
              title="Copy link"
            >
              <AnimatePresence mode="wait">
                {copiedLink ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          {isPublished && shareLink && (
            <Link href={shareLink.url} target="_blank">
              <button className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
                Open in new tab
              </button>
            </Link>
          )}
        </div>

        <div className="h-px bg-neutral-100" />

        {/* QR Code */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Smartphone size={16} className="text-neutral-400" /> QR Code
          </h3>
          <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <div className="w-24 h-24 bg-white rounded-lg p-1 border border-neutral-200 shadow-sm shrink-0 flex items-center justify-center">
              {loadingQr && isPublished ? (
                <div className="w-full h-full bg-neutral-100 animate-pulse rounded flex items-center justify-center">
                  <Loader2 size={24} className="text-neutral-300 animate-spin" />
                </div>
              ) : qrData?.qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrData.qrCode} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-neutral-100 rounded" />
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <p className="text-xs font-medium text-neutral-500 leading-relaxed">
                Users can scan this code to easily open the form on their mobile devices.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <button onClick={() => handleDownloadQR("png")} disabled={!qrData} className="flex-1 py-1.5 px-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <Download size={12} /> PNG
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Embed */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Code size={16} className="text-neutral-400" /> Embed on your website
          </h3>
          <div className="bg-neutral-900 rounded-xl p-3 overflow-x-auto custom-scrollbar relative group border border-neutral-800 min-h-[60px] flex items-center">
            {loadingLink && isPublished ? (
              <div className="h-4 bg-neutral-800 w-full animate-pulse rounded" />
            ) : (
              <pre className="text-[11px] text-neutral-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                <span className="text-pink-400">&lt;iframe</span> <span className="text-green-300">src</span>=<span className="text-yellow-300">"{formUrl}"</span> <span className="text-green-300">width</span>=<span className="text-yellow-300">"100%"</span> <span className="text-green-300">height</span>=<span className="text-yellow-300">"600px"</span> <span className="text-green-300">frameborder</span>=<span className="text-yellow-300">"0"</span><span className="text-pink-400">&gt;&lt;/iframe&gt;</span>
              </pre>
            )}
          </div>
          <button 
            onClick={handleCopyEmbed}
            disabled={(loadingLink && isPublished) || !isPublished}
            className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {copiedEmbed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-neutral-400" />}
            {copiedEmbed ? "Copied!" : "Copy Embed Code"}
          </button>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Schedule */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Clock size={16} className="text-neutral-400" /> Schedule
          </h3>
          <div className="flex flex-col gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">Activate At</span>
                {!scheduleState.activateAt && <span className="text-[10px] font-bold text-neutral-500 bg-white px-1.5 py-0.5 rounded border border-neutral-200">Immediately</span>}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="datetime-local" 
                  value={scheduleState.activateAt}
                  onChange={e => setScheduleState(s => ({...s, activateAt: e.target.value}))}
                  className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                {scheduleState.activateAt && (
                  <button 
                    onClick={() => setScheduleState(s => ({...s, activateAt: ""}))}
                    className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-700 font-bold transition-colors shadow-sm"
                    title="Clear date to start immediately"
                  >
                    Clear
                  </button>
                )}
              </div>
            </label>
            <label className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">Deactivate At</span>
                {!scheduleState.deactivateAt && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">∞ Infinite (Open until closed)</span>}
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="datetime-local" 
                  value={scheduleState.deactivateAt}
                  onChange={e => setScheduleState(s => ({...s, deactivateAt: e.target.value}))}
                  className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                {scheduleState.deactivateAt && (
                  <button 
                    onClick={() => setScheduleState(s => ({...s, deactivateAt: ""}))}
                    className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-700 font-bold transition-colors shadow-sm"
                    title="Clear date for infinite duration"
                  >
                    Clear
                  </button>
                )}
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-neutral-600">Active Now</span>
              <input 
                type="checkbox" 
                checked={scheduleState.isActive}
                onChange={e => setScheduleState(s => ({...s, isActive: e.target.checked}))}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
              />
            </label>
            <button 
              onClick={() => setSchedule({ id: formId, ...scheduleState })}
              disabled={isSavingSchedule}
              className="mt-2 w-full py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center"
            >
              {isSavingSchedule ? <Loader2 size={14} className="animate-spin" /> : "Save Schedule"}
            </button>
          </div>
        </div>

      </div>

      {/* ALWAYS ENABLED SETTINGS */}
      <div className="flex flex-col p-6 gap-8 pt-0">
        <div className="h-px bg-neutral-100" />

        {/* Form Settings Mini */}
        <div className="flex flex-col gap-3 pb-8">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Settings size={16} className="text-neutral-400" /> Form Settings
          </h3>
          <div className="flex flex-col gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-neutral-600">Allow multiple submissions</span>
              <input 
                type="checkbox" 
                checked={allowMultiple}
                onChange={e => updateSettings({ id: formId, settings: { ...settings, allowMultipleSubmissions: e.target.checked } })}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
              />
            </label>

            <div className="h-px bg-neutral-200" />

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5"><Layout size={14} /> Display Mode</span>
              <select 
                value={displayMode}
                onChange={e => updateSettings({ id: formId, settings: { ...settings, displayMode: e.target.value } })}
                className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="normal">Normal</option>
                <option value="chat">Chat</option>
                <option value="terminal">Terminal</option>
                <option value="one-by-one">One-by-One</option>
                <option value="swipe">Card Swipe</option>
                <option value="story">Story</option>
                <option value="slide">Slide</option>
              </select>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
