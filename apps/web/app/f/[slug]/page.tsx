"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Lock, Search, Loader2 } from "lucide-react";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";
import { trpc } from "@/src/trpc/client";

type FormState = "LOADING" | "NOT_FOUND" | "UNPUBLISHED" | "READY" | "SUCCESS";

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
  const mode = (resolvedSearchParams.mode as string) || "normal";
  
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
  
  const submitMutation = trpc.responses.submit.useMutation();
  const trackMutation = trpc.analytics.trackEvent.useMutation();

  const form = data?.form;
  const currentVersion = data?.currentVersion;

  useEffect(() => {
    if (isLoading) {
      setFormState("LOADING");
      return;
    }
    if (isError || !form) {
      setFormState("NOT_FOUND");
      return;
    }
    if (form.status !== "published") {
      setFormState("UNPUBLISHED");
      return;
    }
    setFormState("READY");
  }, [isLoading, isError, form]);

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
          device: getDeviceType(),
          browser: getBrowser(),
          userAgent: navigator.userAgent,
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
    } catch (err) {
      console.error("Submission failed:", err);
      // Optional: Add toast notification for failure
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
    if (currentVersion?.schema) {
      return currentVersion.schema as any;
    }
    return { fields: [], settings: {} };
  }, [currentVersion]);

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

  const isSpecialMode = mode !== "normal";

  return isSpecialMode ? (
    <div className="w-full flex justify-center items-center h-full min-h-screen">
      <FormRenderer 
        schema={schema} 
        mode={mode as any}
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
          mode={mode as any}
          onSubmit={handleSubmit}
        />
      </motion.div>
    </div>
  );
}
