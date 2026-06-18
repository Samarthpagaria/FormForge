"use client";
import React from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

const FORMS = [
  {
    title: "Customer Feedback",
    bgClass: "bg-blue-50/80 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30",
    buttonClass: "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    questions: [
      { type: 'input', placeholder: 'Your Name' },
      { type: 'input', placeholder: 'Email Address' },
      { type: 'textarea', placeholder: 'How can we improve?' },
    ],
  },
  {
    title: "Event Registration",
    bgClass: "bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30",
    buttonClass: "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    questions: [
      { type: 'input', placeholder: 'Full Name' },
      { type: 'input', placeholder: 'Company' },
      { type: 'input', placeholder: 'Dietary Requirements' },
      { type: 'input', placeholder: 'Plus One?' },
    ],
  },
  {
    title: "Bug Report",
    bgClass: "bg-rose-50/80 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30",
    buttonClass: "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    questions: [
      { type: 'input', placeholder: 'Issue Title' },
      { type: 'textarea', placeholder: 'Steps to reproduce...' },
      { type: 'input', placeholder: 'Environment (OS/Browser)' },
    ],
  },
  {
    title: "Job Application",
    bgClass: "bg-violet-50/80 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800/30",
    buttonClass: "bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]",
    questions: [
      { type: 'input', placeholder: 'First Name' },
      { type: 'input', placeholder: 'Last Name' },
      { type: 'input', placeholder: 'LinkedIn Profile URL' },
      { type: 'textarea', placeholder: 'Cover Letter' },
    ],
  },
  {
    title: "Product Survey",
    bgClass: "bg-amber-50/80 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30",
    buttonClass: "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    questions: [
      { type: 'input', placeholder: 'Which product do you use?' },
      { type: 'input', placeholder: 'Overall satisfaction (1-10)' },
      { type: 'textarea', placeholder: 'Any additional comments?' },
    ],
  }
];

function FormPreview({ form }: { form: typeof FORMS[0] }) {
  return (
    <div className={`w-full h-full flex flex-col border rounded-2xl overflow-hidden backdrop-blur-sm ${form.bgClass}`}>
      {/* macOS Style Window Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>

      {/* Form Content */}
      <div className="flex flex-col p-6 flex-1">
        <div className="text-xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">{form.title}</div>
        <div className="flex flex-col gap-4 flex-1">
          {form.questions.map((q, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="w-16 h-2 rounded-full bg-neutral-300/50 dark:bg-neutral-700/50" />
              {q.type === 'textarea' ? (
                <div className="w-full h-20 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 flex items-start p-3 shadow-sm">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{q.placeholder}</span>
                </div>
              ) : (
                <div className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 flex items-center px-3 shadow-sm">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{q.placeholder}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={`mt-6 h-10 w-full rounded-md flex items-center justify-center text-sm font-semibold transition-transform hover:scale-[1.02] cursor-pointer ${form.buttonClass}`}>
          Submit Form
        </div>
      </div>
    </div>
  )
}

export function ThreeDMarqueeDemo() {
  const items = Array.from({ length: 24 }).map((_, i) => (
    <FormPreview key={i} form={FORMS[i % FORMS.length]!} />
  ));

  return (
    <div 
      className="mx-auto my-10 max-w-[800px] xl:max-w-[1000px] 2xl:max-w-7xl"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
      }}
    >
      <div
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }}
      >
        <ThreeDMarquee items={items} />
      </div>
    </div>
  );
}
