"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ── Data ─────────────────────────────────────── */
const submissionsOverTimeData = [
  { date: "Jan", last: 200, current: 100 },
  { date: "Feb", last: 165, current: 165 },
  { date: "Mar", last: 280, current: 105 },
  { date: "Apr", last: 340, current: 320 },
  { date: "May", last: 200, current: 340 },
  { date: "Jun", last: 220, current: 210 },
];

const formPerformanceData = [
  { name: "Feedback", value: 320 },
  { name: "Newsletter", value: 245 },
  { name: "Contact", value: 180 },
  { name: "Order", value: 140 },
  { name: "RSVP", value: 95 },
];

const deviceData = [
  { name: "Desktop", value: 60, color: "#18181b" },
  { name: "Mobile",  value: 30, color: "#52525b" },
  { name: "Tablet",  value: 10, color: "#a1a1aa" },
];

/* ── Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 text-left select-none min-w-[120px]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 mb-1.5">{label}</p>
        {payload.map((pld: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
              {pld.name}
            </span>
            <span className="font-semibold text-neutral-800 dark:text-zinc-100">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Panel wrapper ────────────────────────────── */
function Panel({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Main export ──────────────────────────────── */
export function ChartsRow() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[320px] rounded-2xl border border-neutral-200/80 dark:border-zinc-800/80 bg-neutral-50/50 dark:bg-zinc-900/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    /* Bento: large area chart spans 2 cols, device pie + top forms in 1 col */
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── 1. Signed over time (dual-area style) — 2 cols ── */}
      <Panel delay={0} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-zinc-500">Submissions over time</p>
          </div>
          <span className="text-[10px] font-medium text-neutral-500 dark:text-zinc-400 border border-neutral-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            Jan – Jun
          </span>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={submissionsOverTimeData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <defs>
                {/* hatched-style fill using low opacity solid */}
                <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#a1a1aa" strokeWidth="1.5" strokeOpacity="0.4" />
                </pattern>
                <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#52525b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#52525b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
              <XAxis dataKey="date" stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {/* Solid area — "last period" */}
              <Area
                type="monotone"
                dataKey="last"
                name="Last period"
                stroke="#a1a1aa"
                strokeWidth={1.5}
                fill="url(#hatch)"
                fillOpacity={1}
              />
              {/* Dashed line — "current period" */}
              <Area
                type="monotone"
                dataKey="current"
                name="Current period"
                stroke="#18181b"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#fillCurrent)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 text-[10px] font-medium text-neutral-400 dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-[1.5px] bg-neutral-400 inline-block rounded-full" />
            Last period
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-[1.5px] bg-neutral-800 dark:bg-zinc-200 inline-block rounded-full" style={{ backgroundImage: "repeating-linear-gradient(to right,currentColor 0,currentColor 4px,transparent 4px,transparent 7px)" }} />
            Current
          </span>
        </div>
      </Panel>

      {/* ── 2. Right column: device breakdown + top forms ── */}
      <div className="flex flex-col gap-4">

        {/* Device pie */}
        <Panel delay={0.1} className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-zinc-500 mb-4">Device breakdown</p>
          <div className="relative h-[120px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={38} outerRadius={52} paddingAngle={4} dataKey="value">
                  {deviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-neutral-800 dark:text-zinc-100">1.2K</span>
              <span className="text-[9px] font-medium text-neutral-400 dark:text-zinc-500 uppercase tracking-wider">sessions</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-neutral-400 dark:text-zinc-500 font-medium">
            {deviceData.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value}%)
              </span>
            ))}
          </div>
        </Panel>

        {/* Top forms mini list */}
        <Panel delay={0.15}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-zinc-500 mb-3">Top forms</p>
          <div className="flex flex-col gap-2">
            {formPerformanceData.map((f, i) => {
              const pct = Math.round((f.value / formPerformanceData[0].value) * 100);
              return (
                <div key={f.name} className="flex items-center gap-2">
                  <span className="text-[10px] w-4 text-neutral-400 dark:text-zinc-600 tabular-nums">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-medium text-neutral-700 dark:text-zinc-300">{f.name}</span>
                      <span className="text-neutral-400 dark:text-zinc-500 text-[10px]">{f.value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-neutral-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-neutral-700 dark:bg-zinc-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

      </div>
    </div>
  );
}
