"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

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

            {/* CTA button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              disabled={!name.trim()}
              onClick={() => router.push("/forms/new")}
              className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #18181b 100%)",
                backgroundSize: "200% 200%",
                animation: "btnGrad 4s ease infinite",
              }}
            >
              <Sparkles size={15} className="stroke-[1.75]" />
              Start building
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
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12">
          {/* Big crosshair icon */}
          <div className="mb-6 relative">
            <div
              className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center"
            >
              {/* Crosshair SVG */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-neutral-700">
                <circle cx="18" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="18" y1="2"  x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="26" x2="18" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2"  y1="18" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="26" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
            Templates coming soon
          </h2>
          <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
            Pre-built form templates will appear here. For now, start with a
            blank form on the left.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
