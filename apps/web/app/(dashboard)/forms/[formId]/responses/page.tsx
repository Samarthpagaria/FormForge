  "use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Smartphone, 
  Download,
  Monitor,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion, AnimatePresence } from "motion/react";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

export default function ResponsesPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data: submissions, isLoading } = trpc.responses.getAll.useQuery({ formId });
  const { data: activeSubDetails, isLoading: isLoadingDetails } = trpc.responses.getById.useQuery(
    { id: selectedSub || "" },
    { enabled: !!selectedSub }
  );

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter(sub => {
      const searchLower = search.toLowerCase();
      const meta = sub.meta as any;
      const deviceMatch = meta?.device?.toLowerCase().includes(searchLower);
      const sessionMatch = sub.sessionId?.toLowerCase().includes(searchLower);
      const idMatch = sub.id.toLowerCase().includes(searchLower);
      return search === "" || deviceMatch || sessionMatch || idMatch;
    });
  }, [search, submissions]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await utils.responses.exportCSV.fetch({ formId });
      if (!data.csv) {
        toast.warning("No responses to export.");
        return;
      }
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses_${formId}.csv`;
      a.click();
      toast.success("CSV exported successfully!");
    } catch (e) {
      toast.error("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingle = () => {
    if (!activeSubDetails) return;
    const headers = ["Field", "Answer"];
    const rows = activeSubDetails.answers.map(a => [a.fieldKey || "Unknown", String(a.value || "")]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission_${activeSubDetails.id.split("-")[0]}.csv`;
    a.click();
    toast.success("Submission exported!");
  };

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden">
      
      {/* ── Background Decorative Blobs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#f0ecd6] rounded-full blur-[90px] -z-10 pointer-events-none opacity-50" />

      <div className="flex-1 w-[90%] mx-auto relative z-10 flex flex-col">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/forms">
              <button className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">
                {form?.name ? `${form.name} Responses` : "Responses"}
              </h1>
              <p className="text-neutral-500 text-sm mt-0.5">{submissions?.length || 0} total responses</p>
            </div>
          </div>
          
          <ShinyButton onClick={handleExport} disabled={isExporting || submissions?.length === 0} className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {isExporting ? <span className="animate-pulse">Exporting...</span> : <><Download size={16} /> Export CSV</>}
          </ShinyButton>
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex gap-6 flex-1 min-h-[600px]">
          
          {/* Table Container */}
          <div className={`bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-[2rem] shadow-sm overflow-visible flex flex-col transition-all duration-300 ${selectedSub ? 'w-2/3 hidden lg:flex' : 'w-full'}`}>
            
            {/* ── Table Header Toolbar ── */}
            <div className="p-5 border-b border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 rounded-t-[2rem]">
              
              {/* Search Bar on Table Header */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search metadata..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-neutral-200 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d351e]/20 transition-all shadow-sm"
                />
              </div>

            </div>

            {/* Table Content */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-neutral-50/50 border-b border-neutral-200/60 text-neutral-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">#</th>
                    <th className="px-6 py-4 font-semibold">Submission ID</th>
                    <th className="px-6 py-4 font-semibold">Submitted At</th>
                    <th className="px-6 py-4 font-semibold">Device</th>
                    <th className="px-6 py-4 font-semibold">Session ID</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-6 bg-neutral-200/50 animate-pulse rounded-md" />
                        </td>
                      </tr>
                    ))
                  ) : filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        {search ? "No responses found matching your search." : "No submissions yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub, idx) => {
                      const meta = sub.meta as any;
                      const device = meta?.device || "Unknown";
                      return (
                        <motion.tr 
                          key={sub.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedSub(selectedSub === sub.id ? null : sub.id)}
                          className={`cursor-pointer transition-colors ${selectedSub === sub.id ? 'bg-[#d9e5c9]/30' : 'hover:bg-neutral-50/80'}`}
                        >
                          <td className="px-6 py-4 font-medium text-neutral-400">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-neutral-500">
                              {sub.id.split("-")[0]}...
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-neutral-800">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : ""}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-neutral-600 capitalize">
                              {device === 'desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                              {device}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-neutral-600 font-mono text-xs">
                            {sub.sessionId ? `${sub.sessionId.slice(0, 8)}...` : "None"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                              <CheckCircle2 size={12} />
                              Complete
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-neutral-200/60 p-4 bg-white/50 flex items-center justify-between text-sm text-neutral-500 rounded-b-[2rem]">
              <span>Showing {filteredSubmissions.length} responses</span>
            </div>
          </div>

          {/* Side Panel (Submission Details) */}
          <AnimatePresence mode="popLayout">
            {selectedSub && (
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="w-full lg:w-1/3 bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-[2rem] shadow-xl shadow-neutral-200/40 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800">Submission Details</h2>
                    <p className="text-xs text-neutral-500 mt-1">ID: <span className="font-mono">{selectedSub.split("-")[0]}...</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handleExportSingle}
                      className="p-1.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Export this submission"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => setSelectedSub(null)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
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
                           <div className="h-3 w-24 bg-neutral-200 animate-pulse rounded mb-2" />
                           <div className="h-10 w-full bg-neutral-100 animate-pulse rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : activeSubDetails ? (
                    <div className="space-y-6">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Submitted</p>
                          <p className="text-sm font-semibold text-neutral-700">
                            {activeSubDetails.submittedAt ? new Date(activeSubDetails.submittedAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Device</p>
                          <p className="text-sm font-semibold text-neutral-700 capitalize">
                            {(activeSubDetails.meta as any)?.device || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-px bg-neutral-100" />

                      {activeSubDetails.answers.length === 0 ? (
                         <p className="text-sm text-neutral-500 italic">No answers found for this submission.</p>
                      ) : (
                         activeSubDetails.answers.map((answer, i) => (
                           <div key={i}>
                             <p className="text-xs font-semibold text-neutral-500 mb-2">{answer.fieldKey}</p>
                             <div className="text-sm text-neutral-800 bg-white border border-neutral-200 px-3 py-2 rounded-lg break-words">
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
    </div>
  );
}
