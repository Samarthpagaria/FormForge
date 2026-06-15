"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Settings } from "lucide-react";
import Link from "next/link";

interface FloatingActionsProps {
  onRefresh: () => void;
  onAIClick?: () => void;
  isRefreshing?: boolean;
}

const btnBase =
  "flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-neutral-500 dark:text-zinc-400 shadow-md backdrop-blur-md hover:text-neutral-900 dark:hover:text-zinc-100 hover:border-neutral-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer";

function Tooltip({ label }: { label: string }) {
  return (
    <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out whitespace-nowrap bg-neutral-900 text-neutral-100 dark:bg-white dark:text-neutral-900 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm select-none">
      {label}
    </div>
  );
}

export function FloatingActions({
  onRefresh,
  onAIClick,
  isRefreshing = false,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50">

      {/* Settings */}
      <div className="group relative">
        <Tooltip label="Settings" />
        <Link href="/settings">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className={btnBase}
          >
            <Settings size={17} className="stroke-[1.75]" />
          </motion.div>
        </Link>
      </div>

      {/* Refresh */}
      <div className="group relative">
        <Tooltip label="Refresh data" />
        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={btnBase}
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
            <RefreshCw size={17} className="stroke-[1.75]" />
          </motion.div>
        </motion.button>
      </div>

      {/* AI */}
      <div className="group relative">
        <Tooltip label="AI Assistant" />
        <motion.button
          onClick={onAIClick}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(15,15,15,0)",
              "0 0 0 8px rgba(15,15,15,0.07)",
              "0 0 0 0 rgba(15,15,15,0)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-neutral-900 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
        >
          <Sparkles size={17} className="stroke-[1.75]" />
        </motion.button>
      </div>

    </div>
  );
}
