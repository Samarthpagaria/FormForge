"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { CustomDateRangePicker } from "@/components/ui/date-range-picker";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { trpc } from "@/src/trpc/client";

// Hardcoded Data for unsupported charts
const generateHeatmapData = () => {
  const weeks = 52;
  const days = 7;
  const data = [];
  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      const rand = Math.random();
      let level = 0;
      if (rand > 0.95) level = 4;
      else if (rand > 0.8) level = 3;
      else if (rand > 0.5) level = 2;
      else if (rand > 0.2) level = 1;
      week.push(level);
    }
    data.push(week);
  }
  return data;
};

const HEATMAP_DATA = generateHeatmapData();

const getHeatmapColor = (level: number) => {
  switch(level) {
    case 4: return "bg-[#2d351e]"; 
    case 3: return "bg-[#4a5832]"; 
    case 2: return "bg-[#8ba059]"; 
    case 1: return "bg-[#d9e5c9]"; 
    default: return "bg-neutral-100"; 
  }
};

const MAP_DATA = [
  { id: "USA", name: "United States", value: 2005, coordinates: [-95.7129, 37.0902] as [number, number], percentage: 30 },
  { id: "GBR", name: "United Kingdom", value: 802, coordinates: [-3.4359, 55.3781] as [number, number], percentage: 12 },
  { id: "CAN", name: "Canada", value: 601, coordinates: [-106.3468, 56.1304] as [number, number], percentage: 9 },
  { id: "ITA", name: "Italy", value: 535, coordinates: [12.5674, 41.8719] as [number, number], percentage: 8 },
  { id: "AUS", name: "Australia", value: 401, coordinates: [133.7751, -25.2744] as [number, number], percentage: 6 },
];

const mapColorScale = scaleLinear<string>().domain([0, 2000]).range(["#f5f5f3", "#8b5cf6"]);

const OVER_TIME_DATA = [
  { date: "Mon", submissions: 120 },
  { date: "Tue", submissions: 150 },
  { date: "Wed", submissions: 90 },
  { date: "Thu", submissions: 220 },
  { date: "Fri", submissions: 180 },
  { date: "Sat", submissions: 100 },
  { date: "Sun", submissions: 140 },
];

const TRAFFIC_DATA = [
  { source: "Direct", percentage: 60 },
  { source: "QR Code", percentage: 30 },
  { source: "Embed", percentage: 10 },
];

const TIME_DISTRIBUTION = [
  { bucket: "0-30s", percentage: 20 },
  { bucket: "30-60s", percentage: 40 },
  { bucket: "1-2m", percentage: 30 },
  { bucket: "2m+", percentage: 10 },
];

const radarData = [
  { subject: "Mon", A: 800 },
  { subject: "Tue", A: 600 },
  { subject: "Wed", A: 600 },
  { subject: "Thu", A: 200 },
  { subject: "Fri", A: 400 },
  { subject: "Sat", A: 1000 },
  { subject: "Sun", A: 400 },
];

const radialData = [
  { name: "Series 1", value: 866, fill: "#8b5cf6" },
];

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
  
  // Real Queries
  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data: summary, isLoading: loadingSummary, isError: errSummary, refetch: refetchSummary } = trpc.analytics.getSummary.useQuery({ formId });
  const { data: dropoffData, isLoading: loadingDropoff, isError: errDropoff, refetch: refetchDropoff } = trpc.analytics.getDropoffAnalysis.useQuery({ formId });
  const { data: deviceData, isLoading: loadingDevices, isError: errDevices, refetch: refetchDevices } = trpc.analytics.getDeviceStats.useQuery({ formId });

  const isLoading = loadingSummary || loadingDropoff || loadingDevices;
  const isError = errSummary || errDropoff || errDevices;

  const handleRefresh = () => {
    refetchSummary();
    refetchDropoff();
    refetchDevices();
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

  if (isError) {
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
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4 mt-2">
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

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">

          {/* Bento Grid (Heatmap + Date Picker) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col w-full overflow-hidden">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Annual Submissions Heatmap</p>
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-1 min-w-max">
                  <div className="flex flex-col gap-1 pr-2 text-[10px] text-neutral-400 font-medium">
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Mon</span>
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Wed</span>
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Fri</span>
                    <span className="h-3 leading-3" />
                  </div>
                  <div className="flex gap-1">
                    {HEATMAP_DATA.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((level, dIdx) => (
                          <div key={`${wIdx}-${dIdx}`} className={`w-3 h-3 rounded-[2px] ${getHeatmapColor(level)} transition-colors hover:ring-1 hover:ring-neutral-400`} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200/60 shadow-sm flex flex-col items-center justify-center overflow-hidden h-full">
              <div className="w-full px-4 pt-4 pb-2 border-b border-neutral-100 flex items-center justify-between bg-white">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Date Range Filter</p>
              </div>
              <div className="flex-1 w-full flex">
                <CustomDateRangePicker />
              </div>
            </motion.div>
          </div>

          {/* SECTION 1: Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
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
                    <h3 className="text-3xl font-black text-neutral-800 tracking-tight">{stat.format(stat.value)}</h3>
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
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={OVER_TIME_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
            </div>

            {/* Donut Chart: Device Breakdown */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Device Breakdown</p>
              <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center">
                {loadingDevices ? (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                     <div className="w-32 h-32 rounded-full border-[16px] border-neutral-100 animate-pulse" />
                   </div>
                ) : formattedDeviceData.length === 0 ? (
                  <p className="text-sm text-neutral-400">No device data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="70%">
                      <PieChart>
                        <Pie
                          data={formattedDeviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {formattedDeviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="w-full flex flex-col gap-2 mt-4 px-4">
                      {formattedDeviceData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="font-medium text-neutral-600 capitalize">{d.name}</span>
                          </div>
                          <span className="font-bold text-neutral-800">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

          </motion.div>

          {/* SECTION 3: Field Drop-off Analysis */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col min-h-[150px]">
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
              ) : dropoffData?.length === 0 ? (
                <p className="text-sm text-neutral-400">No drop-off data recorded yet.</p>
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

          {/* SECTION 6: Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            
            {/* Radar Chart */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Weekly Engagement Radar</p>
              <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 12, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 1000]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Radar name="Form Engagement" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Radial Bar Chart */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Total Submissions</p>
              <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="50%" innerRadius="50%" outerRadius="100%" 
                    barSize={16} data={radialData} startAngle={90} endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 1000]} angleAxisId={0} tick={false} />
                    <RadialBar minAngle={15} background={{ fill: '#f5f5f5' }} clockWise dataKey="value" cornerRadius={10} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-800 text-4xl font-bold">
                      {summary?.submissions || 0}
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs font-medium">
                      Submissions
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </div>
    </div>
  );
}
