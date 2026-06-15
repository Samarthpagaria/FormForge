"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Lock, Search } from "lucide-react";
import { DUMMY_FORM_SCHEMA } from "@/components/form-renderer/schema";
import { FormRenderer } from "@/components/form-renderer/FormRenderer";

type FormState = "LOADING" | "NOT_FOUND" | "UNPUBLISHED" | "READY" | "SUCCESS";

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

  useEffect(() => {
    // Simulate loading the form
    const loadForm = async () => {
      setFormState("LOADING");
      await new Promise(r => setTimeout(r, 1200)); // Simulate network latency

      // Demo logic: If the slug ends with '404', show NOT_FOUND. 
      // If it ends with 'draft', show UNPUBLISHED.
      if (slug.includes("404")) {
        setFormState("NOT_FOUND");
      } else if (slug.includes("draft")) {
        setFormState("UNPUBLISHED");
      } else {
        setFormState("READY");
      }
    };
    loadForm();
  }, [slug]);

  const handleSubmit = async (data: any) => {
    // Simulate network submission
    await new Promise(r => setTimeout(r, 1500));
    console.log("Form submitted with data:", data);
    setFormState("SUCCESS");
  };

  const handleReset = () => {
    setFormState("LOADING");
    // Small delay to simulate "refreshing" the form
    setTimeout(() => {
      setFormState("READY");
    }, 600);
  };

  if (formState === "LOADING") {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-8 sm:p-12">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center">
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">Thank you!</h2>
        <p className="text-neutral-500 max-w-sm mb-8">{DUMMY_FORM_SCHEMA.settings.successMessage || "Your response has been recorded successfully."}</p>
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
    <div className="w-full flex justify-center items-center h-full">
      <FormRenderer 
        schema={DUMMY_FORM_SCHEMA} 
        mode={mode}
        onSubmit={handleSubmit}
      />
    </div>
  ) : (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="w-full bg-white rounded-2xl shadow-xl shadow-black/5 border border-neutral-200/50 p-8 sm:p-12 mx-auto"
    >
      <FormRenderer 
        schema={DUMMY_FORM_SCHEMA} 
        mode={mode}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
