"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet, Copy, CheckCircle2, Download, Code, Globe, Lock, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import { DUMMY_FORM_SCHEMA } from "@/components/form-renderer/schema";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";

export default function SharePage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublished, setIsPublished] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState("https://formforge.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);
  
  const formUrl = `${baseUrl}/f/${formId}`;
  
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600px" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

  useEffect(() => {
    QRCode.toDataURL(formUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#5b21b6", // violet-800
        light: "#ffffff"
      }
    }).then(setQrCodeDataUrl).catch(console.error);
  }, [formUrl]);

  const handleCopyLink = () => {
    if (!isPublished) return;
    navigator.clipboard.writeText(formUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    if (!isPublished) return;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadQR = (format: "png" | "svg") => {
    if (!isPublished) return;
    // For simplicity, just downloading the PNG data url we already have
    const link = document.createElement("a");
    link.download = `formforge-qr-${formId}.${format}`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deviceWidths = {
    desktop: "max-w-[640px]",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]"
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#f5f5f3] overflow-hidden">
      
      {/* LEFT PANE — Live Preview */}
      <div className="flex-1 flex flex-col relative z-0 border-r border-neutral-200/60 overflow-hidden">
        
        {/* Background Decorative */}
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[#e3ecd6] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40" />

        {/* Top Bar */}
        <div className="h-16 border-b border-neutral-200/60 bg-white/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Link href={`/forms/${formId}`}>
              <button className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors shadow-sm">
                <ArrowLeft size={16} />
              </button>
            </Link>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Live Preview</p>
              <h2 className="text-sm font-semibold text-neutral-800">{DUMMY_FORM_SCHEMA.title}</h2>
            </div>
          </div>

          <div className="flex items-center bg-white border border-neutral-200/60 rounded-xl p-1 shadow-sm">
            {[
              { id: "desktop", icon: Monitor, label: "Desktop" },
              { id: "tablet", icon: Tablet, label: "Tablet" },
              { id: "mobile", icon: Smartphone, label: "Mobile" }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id as any)}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${device === d.id ? "bg-neutral-100 text-neutral-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                title={d.label}
              >
                <d.icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center custom-scrollbar">
          <motion.div 
            layout
            initial={false}
            animate={{ width: "100%" }}
            className={`w-full ${deviceWidths[device]} bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-8 sm:p-10 min-h-full mx-auto transition-all duration-500 ease-in-out`}
          >
            <FormRenderer schema={DUMMY_FORM_SCHEMA} disabled={true} />
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANE — Share Panel */}
      <div className="w-[380px] bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">Share this form</h2>
          <p className="text-sm text-neutral-500 font-medium truncate mt-0.5">{DUMMY_FORM_SCHEMA.title}</p>
          
          <div className="mt-4 flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-neutral-400"}`} />
              <span className="text-sm font-semibold text-neutral-700">Status: {isPublished ? "Published" : "Draft"}</span>
            </div>
            <button 
              onClick={() => setIsPublished(!isPublished)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isPublished ? "text-neutral-600 hover:bg-neutral-200/50" : "bg-violet-600 text-white hover:bg-violet-700"}`}
            >
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
              <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 flex items-center overflow-hidden">
                <span className="text-sm font-medium text-neutral-600 truncate">{formUrl}</span>
              </div>
              <button 
                onClick={handleCopyLink}
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
            <Link href={`/f/${formId}`} target="_blank">
              <button className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
                Open in new tab
              </button>
            </Link>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* QR Code */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Smartphone size={16} className="text-neutral-400" /> QR Code
            </h3>
            <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="w-24 h-24 bg-white rounded-lg p-1 border border-neutral-200 shadow-sm shrink-0 flex items-center justify-center">
                {qrCodeDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 animate-pulse rounded" />
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-xs font-medium text-neutral-500 leading-relaxed">
                  Users can scan this code to easily open the form on their mobile devices.
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <button onClick={() => handleDownloadQR("png")} className="flex-1 py-1.5 px-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <Download size={12} /> PNG
                  </button>
                  <button onClick={() => handleDownloadQR("svg")} className="flex-1 py-1.5 px-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <Download size={12} /> SVG
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
            <div className="bg-neutral-900 rounded-xl p-3 overflow-x-auto custom-scrollbar relative group border border-neutral-800">
              <pre className="text-[11px] text-neutral-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                <span className="text-pink-400">&lt;iframe</span> <span className="text-green-300">src</span>=<span className="text-yellow-300">"{formUrl}"</span> <span className="text-green-300">width</span>=<span className="text-yellow-300">"100%"</span> <span className="text-green-300">height</span>=<span className="text-yellow-300">"600px"</span> <span className="text-green-300">frameborder</span>=<span className="text-yellow-300">"0"</span><span className="text-pink-400">&gt;&lt;/iframe&gt;</span>
              </pre>
            </div>
            <button 
              onClick={handleCopyEmbed}
              className="w-full py-2.5 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {copiedEmbed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-neutral-400" />}
              {copiedEmbed ? "Copied!" : "Copy Embed Code"}
            </button>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Form Settings Mini */}
          <div className="flex flex-col gap-3 pb-8">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Settings size={16} className="text-neutral-400" /> Form Settings
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-600">Close after X responses</span>
                <select className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20">
                  <option>∞ Unlimited</option>
                  <option>100 responses</option>
                  <option>500 responses</option>
                  <option>1000 responses</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-600">Success Message</span>
                <input 
                  type="text" 
                  defaultValue="Thank you for submitting!"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
