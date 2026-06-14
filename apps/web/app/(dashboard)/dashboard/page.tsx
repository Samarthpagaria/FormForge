"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ChartsRow } from "@/components/dashboard/charts-row";
import { RecentSubmissions, Submission } from "@/components/dashboard/recent-submissions";
import { FloatingActions } from "@/components/dashboard/floating-actions";
import { Calendar } from "lucide-react";

// Mock Submissions using the new device-aware typed model
const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    formName: "Feedback Survey",
    respondent: "alex.jones@example.com",
    device: "desktop",
    time: "2 mins ago",
    status: "Completed",
  },
  {
    id: "sub-2",
    formName: "Newsletter Sign-up",
    respondent: "sarah.m@outlook.com",
    device: "mobile",
    time: "14 mins ago",
    status: "Completed",
  },
  {
    id: "sub-3",
    formName: "Contact Form",
    respondent: "inquiries@company.com",
    device: "tablet",
    time: "1 hour ago",
    status: "Partial",
  },
  {
    id: "sub-4",
    formName: "Product Order Form",
    respondent: "support@shop.net",
    device: "desktop",
    time: "3 hours ago",
    status: "Completed",
  },
  {
    id: "sub-5",
    formName: "Event RSVP",
    respondent: "rsvp@party.org",
    device: "mobile",
    time: "Yesterday",
    status: "Completed",
  },
];

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 800);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8 select-none">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-zinc-50 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            Real-time insights and forms performance metric trackers
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-zinc-400 bg-neutral-100/50 dark:bg-zinc-900/50 border border-neutral-200/60 dark:border-zinc-800/60 rounded-xl px-3.5 py-1.5 self-start sm:self-auto">
          <Calendar size={13} className="text-neutral-400 dark:text-zinc-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Unified Stats, Charts, and Recent Submissions Wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`dashboard-content-${refreshKey}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="space-y-8"
        >
          <StatsRow />
          <ChartsRow />
          <RecentSubmissions submissions={mockSubmissions} />
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <FloatingActions
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onAIClick={() => console.log("AI Clicked")}
      />

    </div>
  );
}
