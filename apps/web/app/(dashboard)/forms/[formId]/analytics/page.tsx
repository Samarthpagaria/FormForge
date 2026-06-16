"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";
import { RawEventLog } from "@/components/analytics/raw-event-log";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import { trpc } from "@/src/trpc/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#8b5cf6",
  mobile: "#c4b5fd",
  tablet: "#ede9fe",
  unknown: "#f5f3ff"
};

export default function FormAnalyticsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "all">("30");
  
  const days = dateRange === "all" ? 365 : parseInt(dateRange);

  // Real Queries
  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data: summary, isLoading: loadingSummary, isError: errSummary, refetch: refetchSummary } = trpc.analytics.getSummary.useQuery({ formId });
  const { data: dropoffData, isLoading: loadingDropoff, isError: errDropoff, refetch: refetchDropoff } = trpc.analytics.getDropoffAnalysis.useQuery({ formId });
  const { data: deviceData, isLoading: loadingDevices, isError: errDevices, refetch: refetchDevices } = trpc.analytics.getDeviceStats.useQuery({ formId });
  const { data: sotData, isLoading: loadingSot, isError: errSot, refetch: refetchSot } = trpc.analytics.getSubmissionsOverTime.useQuery({ formId, days });

  const handleRefresh = () => {
    refetchSummary();
    refetchDropoff();
    refetchDevices();
    refetchSot();
  };

  const formattedDeviceData = useMemo(() => {
    if (!deviceData || deviceData.length === 0) return [];
    return deviceData.map(d => ({
      name: d.device || "Unknown",
      value: d.count,
      color: DEVICE_COLORS[d.device?.toLowerCase() || "unknown"] || DEVICE_COLORS.unknown
    }));
  }, [deviceData]);

  const maxDropoff = useMemo(() => {
    if (!dropoffData || dropoffData.length === 0) return 1;
    return Math.max(...dropoffData.map(d => d.count));
  }, [dropoffData]);

  const submissionsOverTime = useMemo(() => {
    if (!sotData) return [];
    return sotData.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submissions: d.count
    }));
  }, [sotData]);

  if (errSummary) {
    return (
      <div className="relative z-0 min-h-[calc(100vh-64px-1rem)] bg-[#f5f5f3] flex flex-col items-center justify-center p-4 md:px-6 m-2 rounded-2xl border border-neutral-200/60 shadow-sm">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Failed to load analytics</h2>
        <p className="text-neutral-500 mb-6">There was an error fetching your analytics data.</p>
        <button onClick={handleRefresh} className="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 rounded-xl font-medium shadow-sm transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-1rem)] bg-[#f5f5f3] flex flex-col p-4 md:px-6 m-2 rounded-2xl border border-neutral-200/60 shadow-sm overflow-x-hidden overflow-y-auto custom-scrollbar">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#f0ecd6] rounded-full blur-[90px] -z-10 pointer-events-none opacity-50" />

      <div className="flex-1 w-[90%] mx-auto relative z-10 flex flex-col pb-12">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-4">
          <div className="flex items-start gap-4">
            <Link href="/forms">
              <button className="p-2 bg-white/80 backdrop-blur-md rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Form Analytics</h1>
              <p className="text-neutral-500 text-sm mt-0.5">{form?.name || "Loading..."}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors shadow-sm" title="Refresh">
              <RefreshCw size={16} />
            </button>
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

          {/* SECTION 1: Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Views", value: summary?.views ?? 0, format: (v: number) => v.toLocaleString() },
              { label: "Starts", value: summary?.starts ?? 0, format: (v: number) => v.toLocaleString() },
              { label: "Submissions", value: summary?.submissions ?? 0, format: (v: number) => v.toLocaleString() },
              { label: "Completion Rate", value: summary?.completionRate ?? 0, format: (v: number) => `${v}%` },
              { label: "Avg Time", value: summary?.avgTimeSpent ?? 0, format: (v: number) => `${v}s` },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col transition-all hover:shadow-md">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1">{stat.label}</p>
                <div className="flex items-end justify-between mt-auto pt-2">
                  {loadingSummary ? (
                    <div className="h-8 bg-neutral-200/60 animate-pulse rounded w-16" />
                  ) : (
                    <h3 className={`text-3xl font-black tracking-tight ${stat.value === 0 ? "text-neutral-300" : "text-neutral-800"}`}>
                      {stat.format(stat.value)}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* SECTION 2: Charts Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Area Chart: Submissions Over Time */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Submissions Over Time</p>
              {loadingSot ? (
                <div className="animate-pulse bg-neutral-200/50 rounded-xl h-[200px] w-full" />
              ) : errSot ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-red-400">Failed to load data</p>
                  <button onClick={() => refetchSot()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                </div>
              ) : submissionsOverTime.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-400">No submissions yet</p>
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
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#c4b5fd', strokeWidth: 2, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Donut Chart: Device Breakdown */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Device Breakdown</p>
              <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center">
                {loadingDevices ? (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                     <div className="w-32 h-32 rounded-full border-[16px] border-neutral-100 animate-pulse" />
                   </div>
                ) : errDevices ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center mt-4">
                    <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                    <p className="text-sm text-red-400">Failed to load data</p>
                    <button onClick={() => refetchDevices()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                  </div>
                ) : formattedDeviceData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center mt-4">
                    <PieChartIcon className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-400">No device data yet</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="70%">
                      <PieChart>
                        <Pie
                          data={formattedDeviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"
                        >
                          {formattedDeviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="w-full flex flex-col gap-2 mt-4 px-4">
                      {formattedDeviceData.map((d, i) => {
                        const total = formattedDeviceData.reduce((acc, curr) => acc + curr.value, 0);
                        const pct = Math.round((d.value / (total || 1)) * 100);
                        return (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="font-medium text-neutral-600 capitalize">{d.name}</span>
                            </div>
                            <span className="font-bold text-neutral-800">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SECTION 3: Field Drop-off Analysis */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col min-h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Field Drop-offs</p>
              <div className="flex flex-col gap-4">
                {loadingDropoff ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-32 h-4 bg-neutral-200 rounded" />
                      <div className="flex-1 h-8 bg-neutral-100 rounded-lg" />
                      <div className="w-8 h-4 bg-neutral-200 rounded" />
                    </div>
                  ))
                ) : errDropoff ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <AlertCircle className="w-8 h-8 text-red-300 mb-2" />
                    <p className="text-sm text-red-400">Failed to load data</p>
                    <button onClick={() => refetchDropoff()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
                  </div>
                ) : dropoffData?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-400">No drop-offs recorded yet</p>
                  </div>
                ) : (
                  dropoffData?.map((item, i) => {
                    const percentage = maxDropoff > 0 ? (item.count / maxDropoff) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-semibold text-neutral-600 shrink-0 truncate" title={item.fieldKey || "Unknown"}>
                          {item.fieldKey || "Unknown"}
                        </div>
                        <div className="flex-1 h-8 bg-white rounded-lg overflow-hidden relative border border-neutral-200/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            className="h-full bg-violet-500 rounded-r-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-bold text-neutral-800 shrink-0">
                          {item.count}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Radial Bar Chart */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Total Submissions</p>
              <div className="flex-1 min-h-0 w-full relative">
                {loadingSummary ? (
                   <div className="w-full h-full flex items-center justify-center">
                     <div className="w-48 h-48 rounded-full border-[24px] border-neutral-100 animate-pulse" />
                   </div>
                ) : summary?.submissions === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <BarChart2 className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-400">No submissions yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" cy="50%" innerRadius="50%" outerRadius="100%" 
                      barSize={16} data={[{ name: "Submissions", value: summary?.submissions || 0, fill: "#8b5cf6" }]} startAngle={90} endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, Math.max((summary?.views || 1), (summary?.submissions || 1) * 2)]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: '#f5f5f5' }} dataKey="value" cornerRadius={10} />
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-800 text-4xl font-bold">
                        {summary?.submissions || 0}
                      </text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs font-medium">
                        Submissions
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          <RawEventLog formId={formId} />

        </motion.div>
      </div>
    </div>
  );
}
