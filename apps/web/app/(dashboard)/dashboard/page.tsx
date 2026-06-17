"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ChartsRow } from "@/components/dashboard/charts-row";
import { RecentSubmissions } from "@/components/dashboard/recent-submissions";
import { MapRow } from "@/components/dashboard/map-row";
import { Calendar } from "lucide-react";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey]   = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 800);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="space-y-6 select-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-zinc-50 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            Real-time insights and form performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-xl px-3 py-1.5 self-start sm:self-auto shadow-sm">
          <Calendar size={12} className="text-neutral-400 dark:text-zinc-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`dashboard-content-${refreshKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-6"
        >
          {/* Bento row 1 — stats */}
          <StatsRow />

          {/* Bento row 2 — charts */}
          <ChartsRow />

          {/* Map Row */}
          <MapRow />

          {/* Bento row 3 — recent submissions full-width */}
          <RecentSubmissions />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
