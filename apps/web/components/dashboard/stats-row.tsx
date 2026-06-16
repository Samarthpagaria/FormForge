"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FileText, Inbox, Eye, Percent } from "lucide-react";
import { trpc } from "@/src/trpc/client";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({ value, decimals = 0, prefix = "", suffix = "" }: AnimatedNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const formatted = latest.toFixed(decimals);
    if (decimals === 0) return prefix + Number(formatted).toLocaleString() + suffix;
    return prefix + formatted + suffix;
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatsRow() {
  const { data: forms, isLoading, isError } = trpc.forms.getAllForms.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[104px] bg-neutral-200/50 dark:bg-zinc-800/50 animate-pulse rounded-2xl border border-neutral-100 dark:border-zinc-800/80"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-full h-[104px] flex items-center justify-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load statistics.</p>
        </div>
      </div>
    );
  }

  const dynamicStats = [
    { title: "Forms created",        value: forms?.length || 0,    decimals: 0, suffix: "", icon: FileText, trend: "Current total" },
    // TODO: Connect remaining stats to real global metrics when available
    { title: "Submitted responses",  value: 1248,  decimals: 0, suffix: "", icon: Inbox,    trend: "+18% vs last month" },
    { title: "Unique views",         value: 3842,  decimals: 0, suffix: "", icon: Eye,      trend: "+12% vs last month" },
    { title: "Avg. completion",      value: 68.2,  decimals: 1, suffix: "%", icon: Percent,  trend: "+2.1% this week" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {dynamicStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
            className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 cursor-default"
          >
            {/* Thin top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-300 dark:from-zinc-700 dark:via-zinc-400 dark:to-zinc-700" />

            <div className="flex h-full">
              {/* Left — 70% info */}
              <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                  {stat.title}
                </span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-zinc-50 tracking-tight mt-2 block">
                  <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] font-normal text-neutral-400 dark:text-zinc-500 mt-2 block">
                  {stat.trend}
                </span>
              </div>

              {/* Right — icon panel */}
              <div className="flex items-center justify-center w-[30%] shrink-0 border-l border-neutral-100 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/40 rounded-r-2xl">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-zinc-800 group-hover:bg-neutral-200 dark:group-hover:bg-zinc-700 transition-colors duration-300">
                  <Icon size={22} className="stroke-[1.5] text-neutral-600 dark:text-zinc-300" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
