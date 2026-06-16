"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet, Copy, CheckCircle2, Download, Code, Globe, Lock, Settings, Loader2, Clock, Layout } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SharePageHeader } from "@/components/share/SharePageHeader";
import { PreviewPane } from "@/components/share/PreviewPane";
import { SharePanel } from "@/components/share/SharePanel";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

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
      toast.success("Form published!");
      utils.forms.getById.invalidate({ id: formId });
      utils.share.getShareLink.invalidate({ formId });
      utils.share.getQRCode.invalidate({ formId });
    },
    onError: (err) => toast.error(err.message || "Failed to publish form"),
  });
  
  const { mutate: unpublish, isPending: isUnpublishing } = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished.");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to unpublish form"),
  });

  const { mutate: updateSettings } = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to save settings"),
  });

  const { mutate: setSchedule, isPending: isSavingSchedule } = trpc.forms.setSchedule.useMutation({
    onSuccess: () => {
      toast.success("Schedule saved");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to save schedule"),
  });

  const settings = (form?.settings as Record<string, any>) || {};
  const allowMultiple = settings.allowMultipleSubmissions !== false;
  const displayMode = settings.displayMode || "normal";

  const [scheduleState, setScheduleState] = useState({
    activateAt: settings.activateAt || "",
    deactivateAt: settings.deactivateAt || "",
    isActive: settings.isActive !== false
  });

  useEffect(() => {
    if (form) {
      setScheduleState({
        activateAt: settings.activateAt || "",
        deactivateAt: settings.deactivateAt || "",
        isActive: settings.isActive !== false
      });
    }
  }, [form]);

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
    desktop: "w-full max-w-[1280px]",
    tablet: "w-[768px]",
    mobile: "w-[375px]"
  };

  const schema = useMemo(() => {
    let baseSchema: any = { fields: [], settings: {} };
    
    if (versions && versions.length > 0) {
      const activeVersion = form?.currentVersionId ? versions.find(v => v.id === form.currentVersionId) : versions[0];
      if (activeVersion?.schema) {
        baseSchema = activeVersion.schema;
      }
    }

    return {
      ...baseSchema,
      title: baseSchema.title || form?.name || "",
      description: baseSchema.description || (form as any)?.description || "",
      fields: (baseSchema.fields || []).map((f: any) => ({
        ...f,
        description: f.description || f.helpText
      }))
    };
  }, [versions, form]);

  return (
    <div className="fixed inset-0 bg-[#f5f5f3] flex flex-col overflow-clip z-10 rounded-[2rem] border border-neutral-200/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] m-3 lg:m-4" style={{ top: 64 }}>
      
      {/* Background Decorative */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[#e3ecd6] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40" />

      {/* MAIN CONTENT SPACING */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 px-6 pt-5 pb-6 w-full max-w-[1800px] mx-auto z-10 relative">
        
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">
          <SharePageHeader 
            formId={formId}
            formName={form?.name}
            loadingForm={loadingForm}
            device={device}
            setDevice={setDevice}
          />
          <PreviewPane
            device={device}
            schema={schema}
            displayMode={displayMode}
            formUrl={formUrl}
          />
        </div>

        <SharePanel 
          formId={formId}
          form={form}
          loadingForm={loadingForm}
          isPublished={isPublished}
          shareLink={shareLink}
          loadingLink={loadingLink}
          qrData={qrData}
          loadingQr={loadingQr}
          formUrl={formUrl}
          embedCode={embedCode}
          togglePublish={togglePublish}
          isPublishing={isPublishing}
          isUnpublishing={isUnpublishing}
          handleCopyLink={handleCopyLink}
          copiedLink={copiedLink}
          handleCopyEmbed={handleCopyEmbed}
          copiedEmbed={copiedEmbed}
          handleDownloadQR={handleDownloadQR}
          scheduleState={scheduleState}
          setScheduleState={setScheduleState}
          setSchedule={setSchedule}
          isSavingSchedule={isSavingSchedule}
          settings={settings}
          updateSettings={updateSettings}
          allowMultiple={allowMultiple}
          displayMode={displayMode}
        />
      </div>

    </div>
  );
}
