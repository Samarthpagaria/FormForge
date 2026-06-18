"use client";

import React, { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Inbox, Download, Search, Monitor, Smartphone, Tablet, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";
// @ts-ignore
import Papa from "papaparse";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device) {
    case "desktop": return <Monitor size={14} className="text-neutral-400" />;
    case "mobile": return <Smartphone size={14} className="text-neutral-400" />;
    case "tablet": return <Tablet size={14} className="text-neutral-400" />;
    default: return <Monitor size={14} className="text-neutral-400" />;
  }
};

export default function GlobalResponsesPage() {
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const { data: submissions, isLoading } = trpc.analytics.getRecentSubmissions.useQuery({ limit: 100 });
  const { data: activeSubDetails, isLoading: isLoadingDetails } = trpc.responses.getById.useQuery(
    { id: selectedSub || "" },
    { enabled: !!selectedSub }
  );

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    const csvData = submissions.map(sub => {
      const meta = sub.meta as Record<string, any>;
      return {
        "Form Name": sub.formName,
        "Session ID": sub.sessionId || "Anonymous",
        "Submitted At": sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Unknown",
        "Device": meta?.device || "Unknown",
        "OS": meta?.os || "Unknown",
        "Browser": meta?.browser || "Unknown",
        "Country": meta?.country || "Unknown"
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "all_form_responses.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const filteredSubmissions = submissions?.filter((sub) => {
    return sub.formName.toLowerCase().includes(search.toLowerCase()) || 
           (sub.sessionId && sub.sessionId.toLowerCase().includes(search.toLowerCase()));
  }) || [];

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] dark:bg-zinc-950 flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] dark:bg-emerald-900/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] dark:bg-emerald-900/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-dashed border-neutral-300 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-zinc-100 tracking-tight">Global Responses</h1>
          <p className="text-neutral-500 dark:text-zinc-400 text-sm mt-1">View all submissions across all your forms</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportCSV}
            disabled={!submissions || submissions.length === 0}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-700 dark:text-zinc-300 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border border-neutral-200 dark:border-zinc-800 shadow-sm disabled:opacity-50"
          >
            <Download size={16} /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search forms or respondents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/50 dark:bg-zinc-900/50 border border-dashed border-neutral-300 dark:border-zinc-700 text-neutral-900 dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d351e]/20 dark:focus:ring-emerald-900/30 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex gap-6 flex-1 min-h-[400px]">
        <div className={`bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col transition-all duration-300 ${selectedSub ? 'w-2/3 hidden lg:flex' : 'w-full'}`}>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200/50 dark:bg-zinc-800/50 rounded-xl" />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
            <div className="text-neutral-300 dark:text-zinc-600 p-4 bg-neutral-100/50 dark:bg-zinc-800/50 rounded-full mb-4">
              <Inbox size={32} className="stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">No submissions found</h3>
            <p className="text-neutral-500 dark:text-zinc-400 text-sm mt-1 max-w-[250px]">
              Try adjusting your search filters or share your forms to get responses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  <th className="py-3 px-4">Form Name</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">OS</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4 text-right">Country</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, idx) => {
                  const meta = sub.meta as Record<string, any>;
                  const device = (meta?.device as string) || "desktop";
                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedSub(selectedSub === sub.id ? null : sub.id)}
                      className={`cursor-pointer border-b border-neutral-200/45 dark:border-zinc-800/60 transition-colors ${
                        selectedSub === sub.id ? 'bg-[#d9e5c9]/30 dark:bg-emerald-900/20' : idx % 2 === 0 ? "bg-transparent hover:bg-white/60 dark:hover:bg-zinc-800/40" : "bg-neutral-50/30 dark:bg-zinc-900/30 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <td className="py-4 px-4 font-medium text-neutral-800 dark:text-zinc-200">
                        {sub.formName}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-zinc-400 font-mono text-xs" title={sub.formVersionId}>
                        {sub.formVersionId?.slice(0, 8) || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-neutral-800 dark:text-zinc-200 text-sm">
                          {sub.submittedAt ? format(new Date(sub.submittedAt), "MMM d, yyyy") : "N/A"}
                        </div>
                        <div className="text-xs text-neutral-400 dark:text-zinc-500">
                          {sub.submittedAt ? format(new Date(sub.submittedAt), "h:mm a") : ""}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-zinc-400 text-sm capitalize">
                          <DeviceIcon device={device} />
                          {device}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-zinc-400 text-sm">
                        {meta?.os || "Unknown"}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 dark:text-zinc-400 text-sm">
                        {meta?.browser || "Unknown"}
                      </td>
                      <td className="py-4 px-4 text-right text-neutral-600 dark:text-zinc-400 text-sm uppercase">
                        {meta?.country || "Unknown"}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Side Panel (Submission Details) */}
        <AnimatePresence mode="popLayout">
          {selectedSub && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="w-full lg:w-1/3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60 rounded-[2rem] shadow-xl shadow-neutral-200/40 dark:shadow-none overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-800/50 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">Submission Details</h2>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">ID: <span className="font-mono">{selectedSub.split("-")[0]}...</span></p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setSelectedSub(null)}
                    className="p-1.5 text-neutral-400 dark:text-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    title="Close"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {isLoadingDetails ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}>
                         <div className="h-3 w-24 bg-neutral-200 dark:bg-zinc-800 animate-pulse rounded mb-2" />
                         <div className="h-10 w-full bg-neutral-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : activeSubDetails ? (
                  <div className="space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-neutral-100 dark:border-zinc-800">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-zinc-500 mb-1">Submitted</p>
                        <p className="text-sm font-semibold text-neutral-700 dark:text-zinc-200">
                          {activeSubDetails.submittedAt ? new Date(activeSubDetails.submittedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-neutral-100 dark:border-zinc-800">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-zinc-500 mb-1">Device</p>
                        <p className="text-sm font-semibold text-neutral-700 dark:text-zinc-200 capitalize">
                          {(activeSubDetails.meta as any)?.device || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {((activeSubDetails.meta as any)?.country && (activeSubDetails.meta as any)?.country !== 'Unknown') || ((activeSubDetails.meta as any)?.lat && (activeSubDetails.meta as any)?.lng) ? (
                      <div className="bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-neutral-100 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-zinc-500">Location</p>
                          <p className="text-[10px] font-semibold text-neutral-500 dark:text-zinc-400">
                            {(activeSubDetails.meta as any)?.country !== 'Unknown' ? (activeSubDetails.meta as any)?.country : "Unknown Country"}
                            {(activeSubDetails.meta as any)?.ip && (activeSubDetails.meta as any)?.ip !== 'unknown' && ` • ${(activeSubDetails.meta as any)?.ip}`}
                          </p>
                        </div>
                        <div className="w-full h-[160px] bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                          <ComposableMap projectionConfig={{ scale: 120 }} width={400} height={200} style={{ width: "100%", height: "100%" }}>
                            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                              {({ geographies }) => (
                                geographies.map(geo => {
                                  const c = (activeSubDetails.meta as any)?.country;
                                  const isMatch = c && c !== 'Unknown' && (
                                    geo.id === c || 
                                    geo.properties?.ISO_A2 === c || 
                                    geo.properties?.ISO_A3 === c
                                  );
                                  return (
                                    <Geography
                                      key={geo.rsmKey}
                                      geography={geo}
                                      fill={isMatch ? "#c4b5fd" : "#f5f5f5"}
                                      stroke="#ffffff"
                                      strokeWidth={0.5}
                                      style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                                    />
                                  )
                                })
                              )}
                            </Geographies>
                            {(activeSubDetails.meta as any)?.lat && (activeSubDetails.meta as any)?.lng && (
                              <Marker coordinates={[(activeSubDetails.meta as any).lng, (activeSubDetails.meta as any).lat]}>
                                <circle r={4} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
                                <circle r={12} fill="#ef4444" fillOpacity={0.2} />
                              </Marker>
                            )}
                          </ComposableMap>
                        </div>
                      </div>
                    ) : null}

                    <div className="w-full h-px bg-neutral-100 dark:bg-zinc-800" />

                    {activeSubDetails.answers.length === 0 ? (
                       <p className="text-sm text-neutral-500 dark:text-zinc-500 italic">No answers found for this submission.</p>
                    ) : (
                       activeSubDetails.answers.map((answer, i) => (
                         <div key={i}>
                           <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 mb-2">{answer.fieldKey}</p>
                           <div className="text-sm text-neutral-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 px-3 py-2 rounded-lg break-words">
                             {String(answer.value)}
                           </div>
                         </div>
                       ))
                    )}

                  </div>
                ) : (
                  <p className="text-red-500 text-sm">Failed to load submission details.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
