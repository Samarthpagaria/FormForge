"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface FloatingActionsProps {
  onRefresh: () => void;
  onAIClick?: () => void;
  isRefreshing?: boolean;
}

export function FloatingActions({
  onRefresh,
  onAIClick,
  isRefreshing = false,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3.5 z-50">
      
      {/* 1. Refresh Button */}
      <div className="group relative">
        {/* Tooltip */}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out whitespace-nowrap bg-neutral-900 text-neutral-100 dark:bg-neutral-50 dark:text-neutral-950 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm border border-neutral-800 dark:border-neutral-200 select-none">
          Refresh data
        </div>

        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 text-neutral-600 dark:text-zinc-400 shadow-sm backdrop-blur-sm hover:text-neutral-900 dark:hover:text-zinc-100 hover:shadow-md transition-colors duration-300 cursor-pointer"
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              repeat: isRefreshing ? Infinity : 0,
              duration: isRefreshing ? 1 : 0.5,
            }}
          >
            <RefreshCw size={16} className="stroke-[1.75]" />
          </motion.div>
        </motion.button>
      </div>

      {/* 2. AI Assistant Button */}
      <div className="group relative">
        {/* Tooltip */}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out whitespace-nowrap bg-neutral-900 text-neutral-100 dark:bg-neutral-50 dark:text-neutral-950 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm border border-neutral-800 dark:border-neutral-200 select-none">
          AI Assistant
        </div>

        <motion.button
          onClick={onAIClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(91, 33, 182, 0)",
              "0 0 0 8px rgba(91, 33, 182, 0.08)",
              "0 0 0 0 rgba(91, 33, 182, 0)",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 text-white shadow-md shadow-violet-500/15 hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors duration-300 cursor-pointer"
        >
          <Sparkles size={16} className="stroke-[1.75]" />
        </motion.button>
      </div>

    </div>
  );
}
