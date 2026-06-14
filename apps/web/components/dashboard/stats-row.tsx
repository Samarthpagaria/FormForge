"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FileText, Inbox, Eye, Percent } from "lucide-react";

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
    if (decimals === 0) {
      return prefix + Number(formatted).toLocaleString() + suffix;
    }
    return prefix + formatted + suffix;
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatsRow() {
  const stats = [
    {
      title: "Forms created",
      value: 12,
      decimals: 0,
      suffix: "",
      icon: FileText,
      trend: "+2 this week",
    },
    {
      title: "Submitted responses",
      value: 1248,
      decimals: 0,
      suffix: "",
      icon: Inbox,
      trend: "+18% vs last month",
    },
    {
      title: "Unique views",
      value: 3842,
      decimals: 0,
      suffix: "",
      icon: Eye,
      trend: "+12% vs last month",
    },
    {
      title: "Avg. completion",
      value: 68.2,
      decimals: 1,
      suffix: "%",
      icon: Percent,
      trend: "+2.1% this week",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className="relative overflow-hidden bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 cursor-default"
          >
            {/* Minimal left border in violet */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-600 dark:bg-violet-500 rounded-l-2xl transition-transform duration-300 origin-left" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-medium text-neutral-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  {stat.title}
                </span>
                <span className="text-2xl font-semibold text-neutral-900 dark:text-zinc-100 tracking-tight block">
                  <AnimatedNumber
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </span>
                <span className="text-xs font-normal text-neutral-400 dark:text-zinc-500 mt-1 block">
                  {stat.trend}
                </span>
              </div>
              <div className="text-neutral-400 dark:text-zinc-500 p-2 bg-neutral-100/50 dark:bg-zinc-800/50 rounded-xl transition-colors duration-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                <Icon size={18} className="stroke-[1.75]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
