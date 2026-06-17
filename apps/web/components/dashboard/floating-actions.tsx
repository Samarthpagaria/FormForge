"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiAssistant } from "./ai-assistant";

export function FloatingActions() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const btnBase =
    "flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-500 dark:text-zinc-400 shadow hover:text-neutral-900 dark:hover:text-zinc-100 hover:border-neutral-300 dark:hover:border-zinc-700 transition-colors duration-200 cursor-pointer";

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <>
      <div 
        className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
              className="flex flex-col gap-3 mb-1"
            >
              {/* Settings */}
              <motion.div variants={itemVariants} className="group relative flex items-center justify-end">
                <span className="absolute right-14 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none">
                  SETTINGS
                </span>
                <Link href="/settings">
                  <div className={btnBase}>
                    <Settings size={16} />
                  </div>
                </Link>
              </motion.div>

              {/* Refresh */}
              <motion.div variants={itemVariants} className="group relative flex items-center justify-end">
                <span className="absolute right-14 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none">
                  REFRESH
                </span>
                <button onClick={handleRefresh} className={btnBase}>
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                  >
                    <RefreshCw size={16} />
                  </motion.div>
                </button>
              </motion.div>

              {/* AI */}
              <motion.div variants={itemVariants} className="group relative flex items-center justify-end">
                <span className="absolute right-14 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none">
                  AI ASSISTANT
                </span>
                <button
                  onClick={() => setIsAIOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <Sparkles size={16} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 dark:bg-zinc-100 text-white dark:text-neutral-900 shadow-xl cursor-pointer z-10"
        >
          <motion.div
            animate={{ rotate: isHovered ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isHovered ? <X size={20} /> : <Menu size={20} />}
          </motion.div>
        </motion.button>
      </div>
      
      <AiAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </>
  );
}
