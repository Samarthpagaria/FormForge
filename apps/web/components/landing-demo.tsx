"use client";

import React from "react";
import { motion } from "framer-motion";

export function LandingDemo() {
  return (
    <section
      id="demo"
      className="overflow-hidden bg-[#f5f5f3] dark:bg-[#09090b] py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center"
        >
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Product Demo
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50">
            See FormForge in action
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-zinc-400 max-w-2xl">
            A quick walkthrough of building, previewing, and publishing forms. Video coming soon.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-[9px] border border-neutral-200/60 bg-white p-[0.9px] shadow-md dark:border-zinc-800 dark:bg-zinc-900 md:rounded-[20px] md:p-0.5">
            <div className="rounded-[7px] border border-neutral-100 bg-white p-0.5 dark:border-zinc-850 dark:bg-zinc-950 md:rounded-[17px] md:p-[3.5px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-neutral-200/50 bg-neutral-100 dark:border-zinc-800/50 dark:bg-zinc-900 md:rounded-[14px]">
                <img
                  alt="Laptop mockup — demo video placeholder"
                  src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                  className="size-full object-cover object-top dark:hidden"
                />
                <img
                  alt="Laptop mockup — demo video placeholder"
                  src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                  className="size-full object-cover object-top not-dark:hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/5 dark:bg-black/20">
                  <div className="rounded-full border border-dashed border-neutral-300/80 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-500 backdrop-blur-sm dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
                    Video placeholder
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
