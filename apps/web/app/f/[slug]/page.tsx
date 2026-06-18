"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Lock, Loader2, AlertTriangle, Clock, Search } from "lucide-react";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

type FormState = "LOADING" | "NOT_FOUND" | "UNPUBLISHED" | "READY" | "SUCCESS" | "ALREADY_SUBMITTED" | "DEACTIVATED" | "NOT_YET_ACTIVE" | "CLOSED";

// Helper functions for basic analytics
const getDeviceType = () => {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
  return "desktop";
};

const getBrowser = () => {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Unknown";
};

const getOS = () => {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("like Mac")) return "iOS";
  return "Unknown";
};

const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export default function PublicFormPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = React.use(params);
  const resolvedSearchParams = React.use(searchParams);
  const searchMode = resolvedSearchParams.mode as string | undefined;
  const isDraftPreview = resolvedSearchParams.draft === "true";
  
  const [formState, setFormState] = useState<FormState>("LOADING");
  
  // Analytics State
  const sessionId = useRef(generateSessionId());
  const trackedView = useRef(false);
  const trackedStart = useRef(false);
  const startTime = useRef(Date.now());
  
  // Queries & Mutations
  const { data, isLoading, isError } = trpc.forms.getBySlug.useQuery({ slug }, {
    retry: false
  });
  
  const [userIp, setUserIp] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then(res => res.json())
      .then(data => {
        setUserIp(data.ip);
        setUserCountry(data.country_code ? data.country_code.toUpperCase() : "Unknown");
        setUserLat(data.latitude ? parseFloat(data.latitude) : undefined);
        setUserLng(data.longitude ? parseFloat(data.longitude) : undefined);
      })
      .catch(() => {
        setUserIp("unknown");
        setUserCountry("Unknown");
      });
  }, []);

  const checkDuplicateQuery = trpc.responses.checkDuplicate.useQuery(
    { formId: data?.form?.id || "", ip: userIp || "unknown", sessionId: sessionId.current },
    { enabled: !!data?.form?.id && !!userIp && ((data?.form?.settings as any)?.allowMultipleSubmissions === false) }
  );
  
  const submitMutation = trpc.responses.submit.useMutation();
  const trackMutation = trpc.analytics.trackEvent.useMutation();

  const form = data?.form;
  const currentVersion = data?.currentVersion;

  useEffect(() => {
    if (isLoading || !userIp) {
      setFormState("LOADING");
      return;
    }
    if (isError || !form) {
      setFormState("NOT_FOUND");
      return;
    }
    if (form.status !== "published" && !isDraftPreview) {
      setFormState("UNPUBLISHED");
      return;
    }

    const settings = (form.settings as Record<string, any>) ?? {};
    if (settings.isActive === false) {
      setFormState("DEACTIVATED");
      return;
    }
    if (settings.activateAt && new Date() < new Date(settings.activateAt)) {
      setFormState("NOT_YET_ACTIVE");
      return;
    }
    if (settings.deactivateAt && new Date() > new Date(settings.deactivateAt)) {
      setFormState("CLOSED");
      return;
    }

    if (settings.allowMultipleSubmissions === false) {
       if (checkDuplicateQuery.isLoading && checkDuplicateQuery.fetchStatus !== "idle") {
           setFormState("LOADING");
           return;
       }
       if (checkDuplicateQuery.data?.hasSubmitted) {
           setFormState("ALREADY_SUBMITTED");
           return;
       }
    }

    setFormState("READY");
  }, [isLoading, isError, form, userIp, checkDuplicateQuery.isLoading, checkDuplicateQuery.fetchStatus, checkDuplicateQuery.data?.hasSubmitted, isDraftPreview]);

  useEffect(() => {
    if (formState === "READY" && form && currentVersion && !trackedView.current) {
      trackedView.current = true;
      startTime.current = Date.now();
      trackMutation.mutate({
        formId: form.id,
        formVersionId: currentVersion.id,
        sessionId: sessionId.current,
        event: "form_view",
        metadata: {
          device: getDeviceType(),
          browser: getBrowser(),
          os: typeof window !== "undefined" ? navigator.platform : "Unknown",
        }
      });
    }
  }, [formState, form, currentVersion, trackMutation]);

  // Use a capturing event listener for "focusin" to detect form start
  useEffect(() => {
    if (formState !== "READY" || !form || !currentVersion || trackedStart.current) return;
    
    const handleFocus = () => {
      trackedStart.current = true;
      trackMutation.mutate({
        formId: form.id,
        formVersionId: currentVersion.id,
        sessionId: sessionId.current,
        event: "form_start",
        metadata: {
          device: getDeviceType(),
        }
      });
      document.removeEventListener("focusin", handleFocus);
    };

    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, [formState, form, currentVersion, trackMutation]);

  const handleSubmit = async (formData: Record<string, any>) => {
    if (isDraftPreview) {
      toast.info("Submissions are disabled in Draft Preview.");
      return;
    }
    if (!form || !currentVersion) return;
    
    try {
      // Format answers for backend
      const answers = Object.entries(formData).map(([fieldKey, value]) => ({
        fieldKey,
        value,
      }));

      await submitMutation.mutateAsync({
        formId: form.id,
        formVersionId: currentVersion.id,
        answers,
        meta: {
          ip: userIp || "unknown",
          country: userCountry || "Unknown",
          lat: userLat,
          lng: userLng,
          device: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          userAgent: navigator.userAgent,
          completionTime: Math.round((Date.now() - startTime.current) / 1000),
        }
      });

      // Track submit event
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000); // in seconds
      trackMutation.mutate({
        formId: form.id,
        formVersionId: currentVersion.id,
        sessionId: sessionId.current,
        event: "form_submit",
        metadata: {
          timeSpent,
          device: getDeviceType(),
        }
      });

      setFormState("SUCCESS");
    } catch (err: any) {
      if (err instanceof Error && err.message.toLowerCase().includes("already submitted")) {
        setFormState("ALREADY_SUBMITTED");
      } else if (err?.data?.code === "CONFLICT") {
        setFormState("ALREADY_SUBMITTED");
      } else {
        console.error("Submission failed:", err);
        toast.error("Failed to submit form. Please try again.");
      }
    }
  };

  const handleReset = () => {
    sessionId.current = generateSessionId();
    trackedView.current = false;
    trackedStart.current = false;
    startTime.current = Date.now();
    setFormState("LOADING");
    setTimeout(() => {
      setFormState("READY");
    }, 600);
  };

  const schema = useMemo(() => {
    let baseSchema: any = { fields: [], settings: {} };
    if (isDraftPreview && form?.draftSchema) {
      baseSchema = form.draftSchema;
    } else if (currentVersion?.schema) {
      baseSchema = currentVersion.schema;
    }
    
    // Inject DB-level name and description if missing from schema
    return {
      ...baseSchema,
      title: baseSchema.title || form?.name || "",
      description: baseSchema.description || (form as any)?.description || "",
      fields: (baseSchema.fields || []).map((f: any) => ({
        ...f,
        description: f.description || f.helpText
      }))
    };
  }, [currentVersion, searchMode, form, isDraftPreview]);

  if (formState === "LOADING") {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-8 sm:p-12 max-w-[800px] mx-auto my-8">
        <div className="animate-pulse flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="h-8 bg-neutral-200 rounded-lg w-3/4" />
            <div className="h-4 bg-neutral-100 rounded-md w-1/2" />
          </div>
          <div className="h-px bg-neutral-100" />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2"><div className="h-4 w-32 bg-neutral-200 rounded" /><div className="h-10 bg-neutral-100 rounded-lg w-full" /></div>
            <div className="flex flex-col gap-2"><div className="h-4 w-48 bg-neutral-200 rounded" /><div className="h-10 bg-neutral-100 rounded-lg w-full" /></div>
            <div className="flex flex-col gap-2"><div className="h-4 w-40 bg-neutral-200 rounded" /><div className="h-10 bg-neutral-100 rounded-lg w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (formState === "NOT_FOUND") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <Search size={28} className="text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Form not found</h2>
        <p className="text-neutral-500 max-w-sm mb-8">This form doesn't exist or has been deleted by the owner.</p>
        <a href="https://formforge.com" className="py-2.5 px-6 bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl hover:bg-neutral-50 transition-colors shadow-sm">
          Go to FormForge
        </a>
      </motion.div>
    );
  }

  if (formState === "UNPUBLISHED") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center mb-6">
          <Lock size={28} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Form is currently private</h2>
        <p className="text-neutral-500 max-w-sm">The creator hasn't published this form yet. It is not available for public responses.</p>
      </motion.div>
    );
  }

  if (formState === "SUCCESS") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Thank you!</h2>
        <p className="text-neutral-500 max-w-sm mb-8">{schema.settings?.successMessage || "Your response has been recorded successfully."}</p>
        <button 
          onClick={handleReset}
          className="py-2.5 px-6 bg-white border border-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
        >
          Submit another response
        </button>
      </motion.div>
    );
  }

  if (formState === "ALREADY_SUBMITTED") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-red-50 rounded-full border border-red-100 flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Already Submitted</h2>
        <p className="text-neutral-500 max-w-sm mb-8">You've already filled out this form.</p>
      </motion.div>
    );
  }

  if (formState === "DEACTIVATED") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center mb-6">
          <Lock size={28} className="text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Form Deactivated</h2>
        <p className="text-neutral-500 max-w-sm">This form is currently deactivated and not accepting responses.</p>
      </motion.div>
    );
  }

  if (formState === "NOT_YET_ACTIVE") {
    const activateAt = (form?.settings as Record<string, any>)?.activateAt;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center mb-6">
          <Clock size={28} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Form not yet active</h2>
        <p className="text-neutral-500 max-w-sm">This form opens on {new Date(activateAt).toLocaleString()}.</p>
      </motion.div>
    );
  }

  if (formState === "CLOSED") {
    const deactivateAt = (form?.settings as Record<string, any>)?.deactivateAt;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center max-w-[600px] mx-auto my-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center mb-6">
          <Lock size={28} className="text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Form Closed</h2>
        <p className="text-neutral-500 max-w-sm">This form closed on {new Date(deactivateAt).toLocaleString()}.</p>
      </motion.div>
    );
  }

  const displayMode = searchMode || (form?.settings as Record<string, any>)?.displayMode || "normal";
  const isSpecialMode = displayMode !== "normal";

  return (
    <>
      {isDraftPreview && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-neutral-900/90 backdrop-blur text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border border-neutral-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Draft Preview Mode
          </div>
        </div>
      )}
      {isSpecialMode ? (
        <div className="w-full flex justify-center items-center h-full min-h-screen">
      <FormRenderer 
        schema={schema} 
        mode={displayMode as any}
        onSubmit={handleSubmit}
        disabled={submitMutation.isPending}
      />
    </div>
  ) : (
    <div className="w-full min-h-screen bg-[#f5f5f3] py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="w-full max-w-[800px] bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-8 sm:p-12 mx-auto relative"
      >
        {submitMutation.isPending && (
           <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl">
             <div className="bg-white shadow-lg border border-neutral-200 px-6 py-4 rounded-xl flex items-center gap-3">
               <Loader2 size={20} className="animate-spin text-violet-600" />
               <span className="font-semibold text-neutral-700">Submitting...</span>
             </div>
           </div>
        )}
        <FormRenderer 
          schema={schema} 
          mode={displayMode as any}
          onSubmit={handleSubmit}
        />
        </motion.div>
      </div>
      )}
    </>
  );
}
