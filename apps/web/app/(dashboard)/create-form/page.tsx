"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Layout, ArrowLeft } from "lucide-react";

const options = [
  {
    id: "blank",
    title: "Start from scratch",
    description: "Build a fully custom form with your own fields and logic.",
    icon: Plus,
    href: "/forms/new",
    accent: "from-neutral-900 to-neutral-700",
    border: "hover:border-neutral-400 dark:hover:border-zinc-500",
  },
  {
    id: "template",
    title: "Use a template",
    description: "Pick from a library of pre-built form templates to get started fast.",
    icon: Layout,
    href: "/templates",
    accent: "from-zinc-600 to-zinc-400",
    border: "hover:border-neutral-300 dark:hover:border-zinc-600",
  },
];

export default function CreateFormPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 select-none">

      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="self-start mb-8 -mt-4"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-zinc-50 tracking-tight">
          Create a new form
        </h1>
        <p className="text-sm text-neutral-400 dark:text-zinc-500 mt-2">
          Choose how you'd like to get started
        </p>
      </motion.div>

      {/* Option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: "easeOut" }}
            >
              <Link href={opt.href}>
                <div
                  className={`group relative flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${opt.border}`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${opt.accent} flex items-center justify-center shadow-sm`}>
                    <Icon size={20} className="text-white stroke-[1.75]" />
                  </div>

                  {/* Text */}
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-zinc-50">
                      {opt.title}
                    </h2>
                    <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <span className="absolute top-5 right-5 text-neutral-300 dark:text-zinc-700 group-hover:text-neutral-500 dark:group-hover:text-zinc-400 transition-colors duration-200 text-xs">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
