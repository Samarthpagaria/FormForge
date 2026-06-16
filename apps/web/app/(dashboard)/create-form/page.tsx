"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, LayoutTemplate } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

/* ─── Slanted divider ──────────────────────────────────── */
function SlantedDivider() {
  return (
    <div className="relative w-[30px] shrink-0 overflow-hidden self-stretch bg-white">
      <div
        className="absolute inset-0 border border-gray-400 border-t-0 border-b-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #d4d4d8 0px, #d4d4d8 2px, transparent 2px, transparent 5px)",
          backgroundSize: "7px 7px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #d4d4d8 0px, #d4d4d8 2px, transparent 2px, transparent 5px)",
          backgroundSize: "7px 7px",
        }}
      />
    </div>
  );
}

/* ─── Diagonal striped background ────────────────────────── */
function SpotlightBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 0),
          linear-gradient(180deg, rgba(16,185,129,0.25) 1px, transparent 0),
          repeating-linear-gradient(45deg, rgba(16,185,129,0.2) 0 2px, transparent 2px 6px)
        `,
        backgroundSize: "24px 24px, 24px 24px, 24px 24px",
      }}
    />
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function CreateFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { mutate: createForm, isPending: isCreatingBlank, error: blankError } = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created! Redirecting to builder...");
      if (data?.id) router.push(`/forms/${data.id}/builder`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form");
    },
  });

  const { data: templates, isLoading: loadingTemplates } = trpc.templates.getAll.useQuery();
  const { mutate: createFromTemplate, isPending: isCreatingFromTemplate, error: templateError } = trpc.templates.createFormFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Form created from template!");
      router.push(`/forms/${data.id}/builder`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template");
    },
  });

  const handleCreateBlank = () => {
    if (!name.trim()) return;
    createForm({ name: name.trim(), description: desc.trim() });
  };

  const handleUseTemplate = (templateId: string) => {
    if (!name.trim()) {
      toast.warning("Please enter a form name on the left before using a template.");
      return;
    }
    createFromTemplate({ templateId, name: name.trim(), description: desc.trim() });
  };

  return (
    <div
      className="-mx-6 -mt-24 -mb-6 flex"
      style={{ minHeight: "100vh" }}
    >
      {/* ── LEFT — Blank form creator ── */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-1/2 bg-white flex flex-col items-center justify-center px-12 pt-24 pb-16 relative"
      >
        {/* Back link — top-left absolute but below navbar */}
        <div className="absolute top-24 left-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-800 transition-colors duration-200"
          >
            <ArrowLeft size={13} />
            Back
          </Link>
        </div>

        {/* Centered form */}
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
              Start from scratch
            </p>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
              Create a blank form
            </h1>
            <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
              Give your form a name and description to get started.
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {/* Form name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Form name{" "}
                <span className="text-neutral-400 font-normal">(required)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Customer Feedback"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm text-neutral-900 placeholder-neutral-300 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Description{" "}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="What is this form for?"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full text-sm text-neutral-900 placeholder-neutral-300 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 outline-none focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all duration-200 resize-none"
              />
            </div>

            {/* Error Message */}
            {blankError && (
              <p className="text-xs font-semibold text-red-500">
                {blankError.message}
              </p>
            )}

            {/* CTA button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              disabled={!name.trim() || isCreatingBlank}
              onClick={handleCreateBlank}
              className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #18181b 100%)",
                backgroundSize: "200% 200%",
                animation: "btnGrad 4s ease infinite",
              }}
            >
              {isCreatingBlank ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} className="stroke-[1.75]" />
              )}
              {isCreatingBlank ? "Creating..." : "Start building"}
              <style jsx>{`
                @keyframes btnGrad {
                  0%   { background-position: 0% 50%; }
                  50%  { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </motion.button>

            <p className="text-[10px] text-neutral-400 text-center">
              You can always edit these details later
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── DIVIDER ── */}
      <SlantedDivider />

      {/* ── RIGHT — Crosshair grid ── */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="w-1/2 relative flex flex-col items-center justify-center bg-white overflow-hidden"
      >
        {/* Crosshair grid background */}
        <SpotlightBackground />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12 w-full h-full">
          <div className="w-full max-w-lg flex flex-col items-center">
            
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">
              Start from a Template
            </h2>
            <p className="text-sm text-neutral-500 mb-8 max-w-xs leading-relaxed">
              Select a pre-built template to jumpstart your form. <br/><span className="font-semibold text-neutral-700">Enter a form name on the left first!</span>
            </p>

            {templateError && (
              <p className="text-xs font-semibold text-red-500 mb-4">
                {templateError.message}
              </p>
            )}

            {loadingTemplates ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
                <p className="text-xs text-neutral-400 font-medium">Loading templates...</p>
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => !isCreatingFromTemplate && handleUseTemplate(t.id)}
                    className="relative group text-left bg-white/60 backdrop-blur-sm border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <LayoutTemplate size={16} />
                      </div>
                      <h3 className="font-semibold text-neutral-900 truncate flex-1" title={t.name}>{t.name}</h3>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {t.description || "Pre-configured form structure ready to use."}
                    </p>

                    {/* Loading Overlay */}
                    {isCreatingFromTemplate && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <Loader2 size={20} className="animate-spin text-neutral-800" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-neutral-400">
                      <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="18" y1="2"  x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="18" y1="26" x2="18" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="2"  y1="18" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="26" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
                  No templates available yet. Start with a blank form on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
