"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, BarChart2, PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { trpc } from "@/src/trpc/client";

// Reusable Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const getHeatmapColor = (level: number) => {
  switch(level) {
    case 4: return "bg-[#2d351e]"; 
    case 3: return "bg-[#4a5832]"; 
    case 2: return "bg-[#8ba059]"; 
    case 1: return "bg-[#d9e5c9]"; 
    default: return "bg-neutral-100"; 
  }
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "all">("30");

  const days = dateRange === "all" ? 365 : parseInt(dateRange);

  const { data: globalStats, isLoading: statsLoading, isError: statsError, refetch: statsRefetch } = trpc.analytics.getGlobalStats.useQuery();
  const { data: sotRaw, isLoading: sotLoading, isError: sotError, refetch: sotRefetch } = trpc.analytics.getGlobalSubmissionsOverTime.useQuery({ days });
  const { data: deviceRaw, isLoading: deviceLoading, isError: deviceError, refetch: deviceRefetch } = trpc.analytics.getGlobalDeviceBreakdown.useQuery();
  const { data: heatmapRaw, isLoading: heatmapLoading, isError: heatmapError, refetch: heatmapRefetch } = trpc.analytics.getWeeklyActivityHeatmap.useQuery();
  const { data: ctRaw, isLoading: ctLoading, isError: ctError, refetch: ctRefetch } = trpc.analytics.getCompletionTimeDistribution.useQuery();
  const { data: trafficRaw, isLoading: trafficLoading, isError: trafficError, refetch: trafficRefetch } = trpc.analytics.getTrafficSources.useQuery();

  // Mapping data
  const submissionsOverTime = sotRaw?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    submissions: d.count
  })) || [];

  const colorMap: Record<string, string> = { desktop: "#8b5cf6", mobile: "#c4b5fd", tablet: "#ede9fe" };
  const deviceData = deviceRaw?.map(d => ({
    name: d.device ? d.device.charAt(0).toUpperCase() + d.device.slice(1) : "Unknown",
    value: d.count,
    color: colorMap[d.device || "desktop"] || "#8b5cf6"
  })) || [];

  const trafficData = trafficRaw?.map(d => ({
    source: d.source ? d.source.charAt(0).toUpperCase() + d.source.slice(1) : "Unknown",
    percentage: globalStats?.totalViews ? Math.round((d.count / globalStats.totalViews) * 100) : 0
  })) || [];

  const timeDistribution = ctRaw?.map(d => ({
    bucket: d.bucket,
    percentage: globalStats?.totalSubmissions ? Math.round((d.count / globalStats.totalSubmissions) * 100) : 0
  })) || [];

  // Generate heatmap matrix (7 days x 24 hours, or simplified as 7 days x 52 weeks if that's what was mocked)
  // For simplicity based on the prompt's `EXTRACT(DOW)` and `EXTRACT(HOUR)`, we'll build a 7 days x 24 hours matrix
  const heatmapMatrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  if (heatmapRaw) {
    heatmapRaw.forEach(d => {
      // DOW is 0-6 (Sun-Sat), we might map it to 0-6 for Mon-Sun if needed, but 0-6 is fine.
      const day = d.dayOfWeek;
      const hour = d.hour;
      if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23 && heatmapMatrix[day]) {
        heatmapMatrix[day][hour] = d.count;
      }
    });
  }
  const maxHeatmap = Math.max(...heatmapMatrix.flat(), 1);
  const heatmapData = heatmapMatrix.map(dayRow => 
    dayRow.map(count => {
      const ratio = count / maxHeatmap;
      if (ratio === 0) return 0;
      if (ratio < 0.25) return 1;
      if (ratio < 0.5) return 2;
      if (ratio < 0.75) return 3;
      return 4;
    })
  );

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-1rem)] bg-[#f5f5f3] flex flex-col p-4 md:px-6 m-2 rounded-2xl border border-neutral-200/60 shadow-sm overflow-x-hidden overflow-y-auto">
      
      {/* ── Background Decorative Blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      
      <div className="flex-1 w-[90%] mx-auto relative z-10 flex flex-col pb-12">
        
        {/* ── Header ── */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-4">
          <div className="flex items-start gap-4">
            <Link href="/dashboard">
              <button className="p-2 bg-white/80 backdrop-blur-md rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Global Analytics</h1>
              <p className="text-neutral-500 text-sm mt-0.5">Overview of all forms</p>
            </div>
          </div>
        </div>

        {/* ── Date Range Filter ── */}
        <div className="flex items-center gap-4 mb-6 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-neutral-200/60 shadow-sm self-start">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-2">Timeframe:</span>
          <div className="flex gap-2">
            {["7", "30", "90", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  dateRange === range 
                    ? "bg-violet-600 text-white shadow-sm" 
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {range === "all" ? "All time" : `Last ${range} Days`}
              </button>
            ))}
          </div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">

          {/* ── SECTION 1: Stats Row ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-neutral-200/50 dark:bg-zinc-800/30 rounded-xl h-24 w-full" />)
            ) : statsError ? (
              <div className="col-span-4 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center h-24">
                <p className="text-sm text-red-500">Failed to load stats</p>
                <button onClick={() => statsRefetch()} className="text-xs text-violet-600 underline">Retry</button>
              </div>
            ) : (
              [
                { label: "Views", value: globalStats?.totalViews || 0 },
                { label: "Starts", value: Math.round(((globalStats?.totalSubmissions || 0) / ((globalStats?.completionRate || 1)/100)) || 0) }, // Derived
                { label: "Submits", value: globalStats?.totalSubmissions || 0 },
                { label: "Completion Rate", value: `${globalStats?.completionRate || 0}%` },
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col transition-all hover:shadow-md">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between mt-auto pt-2">
                    <h3 className={`text-3xl font-black tracking-tight ${stat.value === 0 || stat.value === "0%" ? "text-neutral-300" : "text-neutral-800"}`}>
                      {stat.value}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </motion.div>

          {/* ── SECTION 2: Charts Row ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Area Chart: Submissions Over Time */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Submissions Over Time</p>
              {sotLoading ? (
                <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[200px] w-full" />
              ) : sotError ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-red-400">Failed to load data</p>
                  <button onClick={() => sotRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                </div>
              ) : submissionsOverTime.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-400">No data yet</p>
                  <p className="text-xs text-neutral-300 mt-1">Data will appear here once your forms receive responses</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={submissionsOverTime} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3a3a3" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3a3a3" }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Donut Chart: Device Breakdown */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Device Breakdown</p>
              {deviceLoading ? (
                <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[200px] w-full mt-4" />
              ) : deviceError ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center mt-4">
                  <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-red-400">Failed to load data</p>
                  <button onClick={() => deviceRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                </div>
              ) : deviceData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center mt-4">
                  <PieChartIcon className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-400">No data yet</p>
                  <p className="text-xs text-neutral-300 mt-1">Data will appear here once your forms receive responses</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none"
                      >
                        {deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full flex flex-col gap-2 mt-4 px-4">
                    {deviceData.map((d, i) => {
                      const total = deviceData.reduce((acc, curr) => acc + curr.value, 0);
                      const pct = Math.round((d.value / (total || 1)) * 100);
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="font-medium text-neutral-600">{d.name}</span>
                          </div>
                          <span className="font-bold text-neutral-800">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          </motion.div>

          {/* ── SECTION 3: Heatmap (Weekly Activity) ── */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col w-full overflow-hidden">
            <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Weekly Activity Heatmap</p>
            {heatmapLoading ? (
              <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[120px] w-full" />
            ) : heatmapError ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                <p className="text-sm text-red-400">Failed to load data</p>
                <button onClick={() => heatmapRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
              </div>
            ) : heatmapData.every(row => row.every(l => l === 0)) ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-400">No data yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-1 min-w-max">
                    <div className="flex flex-col gap-[3px] pr-2 text-[10px] text-neutral-400 font-medium">
                      <span className="h-4 leading-4">Sun</span>
                      <span className="h-4 leading-4">Mon</span>
                      <span className="h-4 leading-4">Tue</span>
                      <span className="h-4 leading-4">Wed</span>
                      <span className="h-4 leading-4">Thu</span>
                      <span className="h-4 leading-4">Fri</span>
                      <span className="h-4 leading-4">Sat</span>
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      {heatmapData.map((day, dIdx) => (
                        <div key={dIdx} className="flex gap-[3px]">
                          {day.map((level, hIdx) => (
                            <div 
                              key={`${dIdx}-${hIdx}`}
                              className={`w-4 h-4 rounded-[3px] ${getHeatmapColor(level)} transition-colors hover:ring-1 hover:ring-neutral-400 cursor-pointer`}
                              title={`Hour: ${hIdx}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-neutral-500 font-medium mt-auto pt-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(l => (
                      <div key={l} className={`w-3 h-3 rounded-[2px] ${getHeatmapColor(l)}`} />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </>
            )}
          </motion.div>

          {/* ── Two Columns for Sections 4 & 5 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* ── SECTION 4: Traffic Sources ── */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Traffic Sources</p>
              {trafficLoading ? (
                <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[150px] w-full" />
              ) : trafficError ? (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-red-400">Failed to load data</p>
                  <button onClick={() => trafficRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                </div>
              ) : trafficData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-400">No data yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {trafficData.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-neutral-600">{item.source}</span>
                        <span className="font-bold text-neutral-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200/60 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-neutral-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── SECTION 5: Average Time Spent ── */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Time Distribution</p>
                {!ctLoading && !ctError && (
                  <div className="bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
                    <p className="text-[10px] font-bold text-violet-700 tracking-wide uppercase">Avg: {globalStats?.avgCompletionTime || 0}s</p>
                  </div>
                )}
              </div>
              {ctLoading ? (
                <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[150px] w-full" />
              ) : ctError ? (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-red-400">Failed to load data</p>
                  <button onClick={() => ctRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                </div>
              ) : timeDistribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[150px] text-center">
                  <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-400">No data yet</p>
                </div>
              ) : (
                <div className="flex-1 min-h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeDistribution} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="bucket" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3a3a3", fontWeight: 600 }} width={60} />
                      <Tooltip 
                        cursor={{ fill: '#f5f5f5' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'Users'] as any}
                      />
                      <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

          </div>

        </motion.div>

      </div>
    </div>
  );
}
