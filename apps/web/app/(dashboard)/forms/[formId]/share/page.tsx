"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet, Copy, CheckCircle2, Download, Code, Globe, Lock, Settings, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { trpc } from "@/src/trpc/client";

export default function SharePage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const utils = trpc.useUtils();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Data Fetching
  const { data: form, isLoading: loadingForm } = trpc.forms.getById.useQuery({ id: formId });
  const { data: versions } = trpc.formVersions.getAll.useQuery({ formId });
  
  const isPublished = form?.status === "published";

  // Share queries (only run if published)
  const { data: shareLink, isLoading: loadingLink } = trpc.share.getShareLink.useQuery(
    { formId }, 
    { enabled: isPublished }
  );
  
  const { data: qrData, isLoading: loadingQr } = trpc.share.getQRCode.useQuery(
    { formId },
    { enabled: isPublished }
  );

  // Mutations
  const { mutate: publish, isPending: isPublishing } = trpc.forms.publish.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id: formId });
      utils.share.getShareLink.invalidate({ formId });
      utils.share.getQRCode.invalidate({ formId });
    }
  });
  
  const { mutate: unpublish, isPending: isUnpublishing } = trpc.forms.unpublish.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId })
  });

  const formUrl = shareLink?.url || `https://formforge.com/f/${form?.slug || "..."}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600px" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

  const handleCopyLink = () => {
    if (!isPublished || !shareLink) return;
    navigator.clipboard.writeText(shareLink.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    if (!isPublished || !shareLink) return;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadQR = (format: "png" | "svg") => {
    if (!isPublished || !qrData) return;
    const link = document.createElement("a");
    link.download = `formforge-qr-${form?.slug}.${format}`;
    link.href = qrData.qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePublish = () => {
    if (isPublished) unpublish({ id: formId });
    else publish({ id: formId });
  };

  const deviceWidths = {
    desktop: "max-w-[640px]",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]"
  };

  const schema = useMemo(() => {
    if (versions && versions.length > 0 && versions[0].schema) {
      return versions[0].schema;
    }
    return { fields: [], settings: {} }; // Fallback
  }, [versions]);

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
              <h2 className="text-sm font-semibold text-neutral-800">
                {loadingForm ? <span className="animate-pulse bg-neutral-200 rounded w-24 h-4 block" /> : form?.name}
              </h2>
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
            <FormRenderer schema={schema as any} disabled={true} />
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANE — Share Panel */}
      <div className="w-[380px] bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 relative">
        
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

          {/* Form Settings Mini */}
          <div className="flex flex-col gap-3 pb-8">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Settings size={16} className="text-neutral-400" /> Form Settings
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-600">Close after X responses</span>
                <select className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50">
                  <option>∞ Unlimited</option>
                  <option>100 responses</option>
                  <option>500 responses</option>
                  <option>1000 responses</option>
                </select>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
