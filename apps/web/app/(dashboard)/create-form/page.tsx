"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, LayoutTemplate, ArrowUpRight } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

// Sample template images from public/templates
const TEMPLATES_IMAGES = [
  "163cd3adf4e0090bc60f98ebd9d9f475.jpg",
  "1ddc1703374fabb5fd617462254c1ffe.jpg",
  "31cef82ad7e7c2a396dee744e37d0532.jpg",
  "3a19281d2cefdc62a6b0eea323a075fa.jpg",
  "3ffbbd1f81cdd606d049635a6c74fc21.jpg",
  "4274f1654027b7e409b2bb09d71a61d3.jpg",
  "628e2610a3e174740a14a350a11e88f8.jpg",
  "74e7847000ae46cc2b4a111ed94578bf.jpg",
  "775bc2f2983313dbd87e60683fa57575.jpg",
  "78bc5ddb1ae40c453058a3850946904f.jpg",
  "7b1d7c0099f4a47f3ff60f673ca76d60.jpg",
  "862348e9fc788c556cc2e3171e5aa54f.jpg",
  "915c799818cd242893285b25e865aac5.jpg",
  "94c742110ef29612384e8eaa36003e5c.jpg",
  "a8323fdbe1bad8d35cf0b36060af1834.jpg",
  "a8861988525237d0d8ed462426d81592.jpg",
  "abd389d19bce9a72046897eff20acd57.jpg",
  "d5176c47761d105078e752d669d11e07.jpg",
  "fbfb9c5fd3fe5eb2800bcccc8b2d47b0.jpg",
  "iage10.jpg",
  "image11.jpg",
  "image12.jpg",
  "image13.jpg",
  "image14.jpg",
  "image15.jpg",
  "image16.jpg",
  "image17.jpg",
  "image18.jpg",
  "image19.jpg",
  "image2.jpg",
  "image20.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg",
  "image5.png",
  "image6.jpg",
  "image7.jpg",
  "image8.jpg",
  "image9.jpg",
  "sceneray.jpg"
];

function getRandomImage(index: number) {
  return `/templates/${TEMPLATES_IMAGES[index % TEMPLATES_IMAGES.length]}`;
}

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.warning("Please enter a form name.");
      return;
    }
    if (selectedTemplateId && !selectedTemplateId.startsWith('dummy')) {
      createFromTemplate({ templateId: selectedTemplateId, name: name.trim(), description: desc.trim() });
    } else {
      createForm({ name: name.trim(), description: desc.trim() });
    }
  };

  const handleTemplateClick = (templateId: string, templateName: string, templateDesc?: string) => {
    setName(templateName);
    if (templateDesc) setDesc(templateDesc);
    setSelectedTemplateId(templateId);
    toast.success(`Selected "${templateName}". Edit details and click Start building.`);
  };

  return (
    <div
      className="-mx-6 -mt-24 -mb-6 flex h-screen overflow-hidden"
    >
      {/* ── LEFT — Blank form creator ── */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-1/2 bg-white flex flex-col items-center justify-center px-12 pt-24 pb-16 relative overflow-y-auto"
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
        <div className="relative w-full max-w-[420px] p-2 rounded-[2rem] shadow-sm overflow-hidden">
          {/* Crosshatch Art - Pink & Orange Gradient Pattern */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #fbcfe8 0%, #fed7aa 50%, #fdba74 100%)",
              backgroundImage: `
                repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(244, 114, 182, 0.2) 2px, rgba(244, 114, 182, 0.2) 3px, transparent 3px, transparent 8px),
                repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(249, 115, 22, 0.18) 2px, rgba(249, 115, 22, 0.18) 3px, transparent 3px, transparent 8px),
                repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(251, 146, 60, 0.15) 2px, rgba(251, 146, 60, 0.15) 3px, transparent 3px, transparent 8px),
                repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(253, 186, 116, 0.12) 2px, rgba(253, 186, 116, 0.12) 3px, transparent 3px, transparent 8px)
              `,
            }}
          />

          <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-8 sm:p-10 shadow-sm border border-white">
            {/* Heading */}
            <div className="mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1.5">
                {selectedTemplateId ? "From Template" : "Start from scratch"}
              </p>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
                {selectedTemplateId ? "Customize form details" : "Create a blank form"}
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
              {templateError && (
                <p className="text-xs font-semibold text-red-500">
                  {templateError.message}
                </p>
              )}

              {/* CTA button */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                disabled={!name.trim() || isCreatingBlank || isCreatingFromTemplate}
                onClick={handleSubmit}
                className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #f97316 100%)",
                  backgroundSize: "200% 200%",
                  animation: "btnGrad 4s ease infinite",
                }}
              >
                {isCreatingBlank || isCreatingFromTemplate ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} className="stroke-[1.75]" />
                )}
                {isCreatingBlank || isCreatingFromTemplate ? "Creating..." : "Start building"}
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
        </div>
      </motion.section>

      {/* ── DIVIDER ── */}
      <SlantedDivider />

      {/* ── RIGHT — Crosshair grid ── */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="w-1/2 relative flex flex-col items-center bg-white overflow-hidden"
      >
        {/* Crosshair grid background */}
        <SpotlightBackground />

        {/* Center content */}
        <div className="absolute inset-0 z-10 flex flex-col pt-28 pb-0 px-4 sm:px-8 w-full">
            
            <h2 className="text-2xl font-bold text-center text-neutral-900 tracking-tight mb-8 shrink-0 w-full">
              Start from a Template
            </h2>

            {templateError && (
              <p className="text-xs font-semibold text-center text-red-500 mb-4 w-full">
                {templateError.message}
              </p>
            )}

            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 w-full">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
                <p className="text-xs text-neutral-400 font-medium">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full flex-1 overflow-y-auto pb-0 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {(templates && templates.length > 0 ? templates : Array.from({ length: 24 }).map((_, i) => ({
                  id: `dummy-${i}`, 
                  name: [
                    'Contact Form', 'Customer Feedback', 'Event Registration', 'Job Application',
                    'Lead Generation', 'Product Survey', 'Bug Report', 'Feature Request',
                    'Workshop Signup', 'Newsletter Opt-in', 'Course Enrollment', 'Support Ticket'
                  ][i % 12] + (i >= 12 ? ' (Advanced)' : '')
                }))).map((template, idx) => (
                  <div 
                    key={template.id} 
                    className="flex justify-center items-start pt-2"
                  >
                    <div className="relative w-full max-w-[240px] bg-[#2d351e] rounded-[2rem] p-1.5 flex flex-col font-sans shadow-[0_25px_50px_-12px_rgba(45,53,30,0.25)] transition-all duration-300 hover:translate-y-[-4px]">
                      
                      <div className="relative w-full h-[200px] bg-[#a8ba8d] rounded-[1.5rem] overflow-hidden z-20 group">
                        <img 
                          src={getRandomImage(idx)} 
                          alt={template.name}
                          className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>

                      <div className="pt-2 pb-2 px-3 flex items-center justify-between mt-1">
                        <div className="flex flex-col flex-1 pr-2">
                          <h3 className="text-white text-base font-semibold tracking-tight truncate" title={template.name}>
                            {template.name}
                          </h3>
                        </div>

                        <button 
                          disabled={isCreatingFromTemplate}
                          onClick={() => handleTemplateClick(template.id, template.name, "template.description")}
                          className={`flex items-center gap-1.5 transition-colors backdrop-blur-md py-1 pl-2.5 pr-2 rounded-full cursor-pointer group shrink-0 disabled:opacity-50 disabled:cursor-wait ${
                            selectedTemplateId === template.id 
                              ? "bg-white/30 text-white" 
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <span className="text-white font-medium text-[10px] tracking-tight">
                            {selectedTemplateId === template.id ? "Selected" : "Use"}
                          </span>
                          {isCreatingFromTemplate && !template.id.startsWith('dummy') && selectedTemplateId === template.id ? (
                            <Loader2 size={12} className="text-white animate-spin" />
                          ) : (
                            <ArrowUpRight size={12} className="text-white/80 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
    </div>
  );
}
