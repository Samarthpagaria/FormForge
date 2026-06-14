"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Mock Data
const performanceData = [
  { name: "Mon", "Feedback Survey": 20, "Contact Form": 14, "Job App": 8, "Newsletter": 35, "Event RSVP": 5, "Order Form": 12 },
  { name: "Tue", "Feedback Survey": 25, "Contact Form": 18, "Job App": 12, "Newsletter": 38, "Event RSVP": 7, "Order Form": 15 },
  { name: "Wed", "Feedback Survey": 32, "Contact Form": 24, "Job App": 10, "Newsletter": 45, "Event RSVP": 12, "Order Form": 18 },
  { name: "Thu", "Feedback Survey": 40, "Contact Form": 20, "Job App": 15, "Newsletter": 52, "Event RSVP": 9, "Order Form": 22 },
  { name: "Fri", "Feedback Survey": 38, "Contact Form": 28, "Job App": 18, "Newsletter": 48, "Event RSVP": 15, "Order Form": 25 },
  { name: "Sat", "Feedback Survey": 52, "Contact Form": 35, "Job App": 14, "Newsletter": 60, "Event RSVP": 20, "Order Form": 32 },
  { name: "Sun", "Feedback Survey": 65, "Contact Form": 42, "Job App": 22, "Newsletter": 75, "Event RSVP": 28, "Order Form": 38 },
];

const submissionsOverTimeData = [
  { date: "May 1", submissions: 30 },
  { date: "May 5", submissions: 45 },
  { date: "May 10", submissions: 38 },
  { date: "May 15", submissions: 62 },
  { date: "May 20", submissions: 55 },
  { date: "May 25", submissions: 78 },
  { date: "May 30", submissions: 82 },
  { date: "Jun 5", submissions: 95 },
  { date: "Jun 10", submissions: 115 },
  { date: "Jun 15", submissions: 130 },
];

const deviceData = [
  { name: "Desktop", value: 60, color: "#5B21B6" },
  { name: "Mobile", value: 30, color: "#7C3AED" },
  { name: "Tablet", value: 10, color: "#A78BFA" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-md backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 text-left select-none">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-zinc-500 mb-1.5">
          {label}
        </p>
        <div className="flex flex-col gap-1">
          {payload.map((pld: any, idx: number) => (
            <div key={idx} className="text-xs font-semibold text-neutral-800 dark:text-zinc-100 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-normal text-neutral-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: pld.color || pld.fill }} />
                {pld.name}
              </span>
              <span>{pld.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ChartsRow() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[340px] rounded-2xl border border-neutral-200/80 dark:border-zinc-800/80 bg-neutral-50/50 dark:bg-zinc-900/40 animate-pulse flex items-center justify-center text-xs text-neutral-400"
          >
            Loading analytics panel...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Form Performance */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      >
        <div>
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-4 select-none">
            Form Performance
          </span>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-850" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Feedback Survey" stroke="#5B21B6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Newsletter" stroke="#7C3AED" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Contact Form" stroke="#4B5563" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Order Form" stroke="#9CA3AF" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Job App" stroke="#D1D5DB" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="Event RSVP" stroke="#A78BFA" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-4 text-[10px] text-neutral-400 dark:text-zinc-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#5B21B6]" />Feedback</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />Newsletter</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#4B5563]" />Contact</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />Order</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />Job App</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />RSVP</span>
        </div>
      </motion.div>

      {/* 2. Submissions Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm"
      >
        <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-4 select-none">
          Submissions Over Time
        </span>
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={submissionsOverTimeData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B21B6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#5B21B6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-850" />
              <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#5B21B6" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmissions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-6 text-[10px] text-neutral-400 dark:text-zinc-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#5B21B6]" />Submitted responses</span>
        </div>
      </motion.div>

      {/* 3. Device Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      >
        <div>
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-4 select-none">
            Device Breakdown
          </span>
          <div className="h-[210px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-bold text-neutral-800 dark:text-zinc-100">1.2K</span>
              <span className="text-[9px] font-medium text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">sessions</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-neutral-400 dark:text-zinc-500 font-medium">
          {deviceData.map((entry) => (
            <span key={entry.name} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name} ({entry.value}%)
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
