"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, Filter, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

// Hardcoded Data
const DUMMY_FORMS_LIST = [
  { id: "1", name: "Customer Feedback 2026" },
  { id: "2", name: "Event Registration" },
  { id: "3", name: "Job Application" },
  { id: "4", name: "Q3 Employee Survey" },
];

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

const mapColorScale = scaleLinear<string>()
  .domain([0, 2000])
  .range(["#f5f5f3", "#8b5cf6"]);

const OVER_TIME_DATA = [
  { date: "Mon", submissions: 120 },
  { date: "Tue", submissions: 150 },
  { date: "Wed", submissions: 90 },
  { date: "Thu", submissions: 220 },
  { date: "Fri", submissions: 180 },
  { date: "Sat", submissions: 100 },
  { date: "Sun", submissions: 140 },
];

const DEVICE_DATA = [
  { name: "Desktop", value: 60, color: "#8b5cf6" }, // violet-500
  { name: "Mobile", value: 30, color: "#c4b5fd" },  // violet-300
  { name: "Tablet", value: 10, color: "#ede9fe" },  // violet-100
];

const DROP_OFF_DATA = [
  { field: "Full Name", percentage: 98 },
  { field: "Email", percentage: 95 },
  { field: "Phone", percentage: 75 },
  { field: "Message", percentage: 52 },
  { field: "How did u hear", percentage: 38 },
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
  { subject: "Mon", A: 800, B: 400, C: 600 },
  { subject: "Tue", A: 600, B: 1000, C: 800 },
  { subject: "Wed", A: 600, B: 200, C: 400 },
  { subject: "Thu", A: 200, B: 600, C: 800 },
  { subject: "Fri", A: 400, B: 200, C: 600 },
  { subject: "Sat", A: 1000, B: 800, C: 600 },
  { subject: "Sun", A: 400, B: 1000, C: 800 },
];

const radialData = [
  { name: "Series 3", value: 660, fill: "#c4b5fd" }, // violet-300
  { name: "Series 2", value: 774, fill: "#8b5cf6" }, // violet-500
  { name: "Series 1", value: 866, fill: "#5b21b6" }, // violet-800
];

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

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFormSelection = (formId: string) => {
    setSelectedForms(prev => 
      prev.includes(formId) ? prev.filter(id => id !== formId) : [...prev, formId]
    );
  };

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-1rem)] bg-[#f5f5f3] flex flex-col p-4 md:px-6 m-2 rounded-2xl border border-neutral-200/60 shadow-sm overflow-x-hidden overflow-y-auto">
      
      {/* ── Background Decorative Blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#f0ecd6] rounded-full blur-[90px] -z-10 pointer-events-none opacity-50" />

      <div className="flex-1 w-[90%] mx-auto relative z-10 flex flex-col pb-12">
        
        {/* ── Header ── */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4 mt-2">
            <Link href="/forms">
              <button className="p-2 bg-white/80 backdrop-blur-md rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Global Analytics</h1>
              <p className="text-neutral-500 text-sm mt-0.5">Overview of all forms</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start xl:items-start gap-3">
            
            {/* Multi-Select Forms Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-sm hover:bg-white transition-colors shadow-sm font-medium"
              >
                <Filter size={16} className="text-neutral-500" />
                {selectedForms.length === 0 ? "All Forms" : `${selectedForms.length} Form${selectedForms.length > 1 ? 's' : ''} Selected`}
                <ChevronDown size={14} className="text-neutral-400" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-2 border-b border-neutral-100 bg-neutral-50/50">
                      <p className="text-xs font-semibold text-neutral-500 px-2 uppercase tracking-wider">Filter by Form</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                      {DUMMY_FORMS_LIST.map(form => {
                        const isSelected = selectedForms.includes(form.id);
                        return (
                          <button
                            key={form.id}
                            onClick={() => toggleFormSelection(form.id)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                              isSelected ? 'bg-violet-50 text-violet-700' : 'hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-violet-600 border-violet-600' : 'bg-white border-neutral-300'
                            }`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                            <span className="truncate">{form.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedForms.length > 0 && (
                      <div className="p-2 border-t border-neutral-100">
                        <button 
                          onClick={() => setSelectedForms([])}
                          className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-800 py-1"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-white transition-colors shadow-sm" title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">

          {/* ── SECTION 7: Bento Grid (Heatmap + Date Picker) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Heatmap Half */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col w-full overflow-hidden">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Annual Submissions Heatmap</p>
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-1 min-w-max">
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col gap-1 pr-2 text-[10px] text-neutral-400 font-medium">
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Mon</span>
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Wed</span>
                    <span className="h-3 leading-3" />
                    <span className="h-3 leading-3">Fri</span>
                    <span className="h-3 leading-3" />
                  </div>
                  {/* Heatmap Grid */}
                  <div className="flex gap-1">
                    {HEATMAP_DATA.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((level, dIdx) => (
                          <div 
                            key={`${wIdx}-${dIdx}`}
                            className={`w-3 h-3 rounded-[2px] ${getHeatmapColor(level)} transition-colors hover:ring-1 hover:ring-neutral-400 cursor-pointer`}
                            title={`${level * 12} submissions`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 text-xs text-neutral-500 font-medium mt-auto pt-2">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(l => (
                    <div key={l} className={`w-3 h-3 rounded-[2px] ${getHeatmapColor(l)}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </motion.div>

            {/* Date Picker Half */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200/60 shadow-sm flex flex-col items-center justify-center overflow-hidden h-full">
              <div className="w-full px-4 pt-4 pb-2 border-b border-neutral-100 flex items-center justify-between bg-white">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Date Range Filter</p>
              </div>
              <div className="flex-1 w-full flex">
                <CustomDateRangePicker />
              </div>
            </motion.div>
          </div>

          {/* ── SECTION 1: Stats Row ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {[
              { label: "Views", value: "1,240", change: "+12%" },
              { label: "Starts", value: "890", change: "+8%" },
              { label: "Submits", value: "654", change: "+15%" },
              { label: "Completion Rate", value: "73%", change: "+5%" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col transition-all hover:shadow-md">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-1">{stat.label}</p>
                <div className="flex items-end justify-between mt-auto pt-2">
                  <h3 className="text-3xl font-black text-neutral-800 tracking-tight">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    {stat.change} &uarr;
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── SECTION 2: Charts Row ── */}
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
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#c4b5fd', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Device Breakdown */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col h-[300px]">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Device Breakdown</p>
              <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={DEVICE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {DEVICE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="w-full flex flex-col gap-2 mt-4 px-4">
                  {DEVICE_DATA.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-medium text-neutral-600">{d.name}</span>
                      </div>
                      <span className="font-bold text-neutral-800">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>

          {/* ── SECTION 3: Field Drop-off Analysis ── */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col">
            <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Where people drop off (Funnel)</p>
            <div className="flex flex-col gap-4">
              {DROP_OFF_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-semibold text-neutral-600 shrink-0 truncate" title={item.field}>
                    {item.field}
                  </div>
                  <div className="flex-1 h-8 bg-white rounded-lg overflow-hidden relative border border-neutral-200/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className="h-full bg-violet-500 rounded-r-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-bold text-neutral-800 shrink-0">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Two Columns for Sections 4 & 5 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* ── SECTION 4: Traffic Sources ── */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col">
              <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Traffic Sources</p>
              <div className="flex flex-col gap-6">
                {TRAFFIC_DATA.map((item, i) => (
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
            </motion.div>

            {/* ── SECTION 5: Average Time Spent ── */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Time Distribution</p>
                <div className="bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
                  <p className="text-[10px] font-bold text-violet-700 tracking-wide uppercase">Avg: 1m 45s</p>
                </div>
              </div>
              <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TIME_DISTRIBUTION} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="bucket" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a3a3a3", fontWeight: 600 }} width={60} />
                    <Tooltip 
                      cursor={{ fill: '#f5f5f5' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value}%`, 'Users']}
                    />
                    <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>

          {/* ── SECTION 6: Advanced Analytics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
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
                    <Radar name="Form A" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    <Radar name="Form B" dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                    <Radar name="Form C" dataKey="C" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
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
                    cx="50%" 
                    cy="50%" 
                    innerRadius="50%" 
                    outerRadius="100%" 
                    barSize={16} 
                    data={radialData} 
                    startAngle={90} 
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 1000]} angleAxisId={0} tick={false} />
                    <RadialBar
                      minAngle={15}
                      background={{ fill: '#f5f5f5' }}
                      clockWise
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-800 text-4xl font-bold">
                      2,300
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs font-medium">
                      Submissions
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>



          {/* ── SECTION 8: Geographic Distribution ── */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col mt-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 mb-6">Top countries by active users</p>
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              
              {/* Map Container */}
              <div className="flex-1 w-full bg-transparent overflow-hidden relative" style={{ minHeight: "250px" }}>
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 120 }}
                  className="w-full h-full object-cover"
                >
                  <Geographies geography="/features-110m.json">
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#e5e5e5"
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#d4d4d8", outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  {MAP_DATA.map(({ id, name, coordinates, value }) => (
                    <Marker key={id} coordinates={coordinates}>
                      <g
                        fill={mapColorScale(value)}
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        transform="translate(-12, -24)"
                      >
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                      </g>
                      <text
                        textAnchor="middle"
                        y={-28}
                        style={{ fontFamily: "inherit", fill: "#52525b", fontSize: "10px", fontWeight: "bold" }}
                      >
                        {name} ({value})
                      </text>
                    </Marker>
                  ))}
                </ComposableMap>
              </div>

              {/* Top Countries Sidebar */}
              <div className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
                <div className="flex flex-col">
                  <h3 className="text-4xl font-black text-neutral-800 tracking-tight">22,829</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    Active users 3.58% &uarr;
                  </span>
                </div>
                
                <div className="flex flex-col gap-4">
                  {MAP_DATA.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-neutral-800">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-violet-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
}
