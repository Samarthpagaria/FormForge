"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Inbox, Download, Search, Monitor, Smartphone, Tablet, ChevronDown } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";
// @ts-ignore
import Papa from "papaparse";

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
  const { data: submissions, isLoading } = trpc.analytics.getRecentSubmissions.useQuery(undefined as any);

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
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-dashed border-neutral-300 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Global Responses</h1>
          <p className="text-neutral-500 text-sm mt-1">View all submissions across all your forms</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportCSV}
            disabled={!submissions || submissions.length === 0}
            className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border border-neutral-200 shadow-sm disabled:opacity-50"
          >
            <Download size={16} /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input 
            type="text" 
            placeholder="Search forms or respondents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/50 border border-dashed border-neutral-300 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d351e]/20 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/50 backdrop-blur-md border border-neutral-200/60 rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200/50 rounded-xl" />
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
            <div className="text-neutral-300 p-4 bg-neutral-100/50 rounded-full mb-4">
              <Inbox size={32} className="stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800">No submissions found</h3>
            <p className="text-neutral-500 text-sm mt-1 max-w-[250px]">
              Try adjusting your search filters or share your forms to get responses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Form Name</th>
                  <th className="py-3 px-4">Respondent</th>
                  <th className="py-3 px-4 text-center">Device</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, idx) => {
                  const meta = sub.meta as Record<string, any>;
                  const device = (meta?.device as string) || "desktop";
                  return (
                    <tr
                      key={sub.id}
                      className={`border-b border-neutral-200/45 hover:bg-white/60 transition-colors ${
                        idx % 2 === 0 ? "bg-transparent" : "bg-neutral-50/30"
                      }`}
                    >
                      <td className="py-4 px-4 font-medium text-neutral-800">
                        {sub.formName}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-mono text-xs">
                        {sub.sessionId?.slice(0, 8) || "Anonymous"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <DeviceIcon device={device} />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-500 text-xs">
                        {sub.submittedAt ? formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true }) : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border bg-[#e3ecd6] text-[#3a4427] border-[#8ba059]/30">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
