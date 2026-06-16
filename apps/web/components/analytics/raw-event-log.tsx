"use client";

import React, { useState, useMemo } from "react";
import { trpc } from "@/src/trpc/client";
import { Search, Monitor, Smartphone, Tablet, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";

interface RawEventLogProps {
  formId: string;
}

const EVENT_COLORS: Record<string, string> = {
  form_view: "bg-emerald-100 text-emerald-700",
  form_start: "bg-blue-100 text-blue-700",
  form_submit: "bg-emerald-100 text-emerald-700",
  form_dropoff: "bg-red-100 text-red-700",
  field_focus: "bg-amber-100 text-amber-700",
  field_blur: "bg-gray-100 text-gray-600",
};

const DEVICE_ICONS: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function RawEventLog({ formId }: RawEventLogProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Events");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const { data: events, isLoading, refetch } = trpc.analytics.getRawEvents.useQuery(
    { formId },
    { refetchInterval: isAutoRefresh ? 30000 : false }
  );

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(e => {
      const typeMatch = filterType === "All Events" || e.event === filterType;
      const searchLower = search.toLowerCase();
      const sessionMatch = e.sessionId?.toLowerCase().includes(searchLower) || false;
      const eventMatch = e.event.toLowerCase().includes(searchLower);
      const searchMatch = search === "" || sessionMatch || eventMatch;
      return typeMatch && searchMatch;
    });
  }, [events, filterType, search]);

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const currentData = filteredEvents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleNextPage = () => setPage(p => Math.min(p + 1, totalPages));
  const handlePrevPage = () => setPage(p => Math.max(p - 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200/60 shadow-sm flex flex-col mt-4 w-full"
    >
      <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Section 6 — Event Log</p>
          <h2 className="text-base font-bold text-neutral-800 mt-1">Raw Event Log</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-48 transition-all"
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-neutral-700 outline-none appearance-none"
          >
            <option value="All Events">All Events</option>
            <option value="form_view">form_view</option>
            <option value="form_start">form_start</option>
            <option value="form_submit">form_submit</option>
            <option value="form_dropoff">form_dropoff</option>
            <option value="field_focus">field_focus</option>
            <option value="field_blur">field_blur</option>
          </select>

          <button 
            onClick={() => {
              if (!isAutoRefresh) refetch();
              setIsAutoRefresh(!isAutoRefresh);
            }}
            className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${isAutoRefresh ? "bg-violet-50 border-violet-200 text-violet-600" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-700"}`}
            title="Auto-refresh (30s)"
          >
            <RefreshCw size={14} className={isAutoRefresh ? "animate-spin-slow" : ""} style={{ animationDuration: '3s' }} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-500 font-bold">
              <th className="p-3 pl-5 w-12">#</th>
              <th className="p-3">Event</th>
              <th className="p-3">Session</th>
              <th className="p-3">Device</th>
              <th className="p-3 text-right pr-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm font-medium text-neutral-700">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3 pl-5"><div className="h-4 w-4 bg-neutral-200 rounded" /></td>
                  <td className="p-3"><div className="h-5 w-24 bg-neutral-200 rounded-full" /></td>
                  <td className="p-3"><div className="h-4 w-20 bg-neutral-200 rounded" /></td>
                  <td className="p-3"><div className="h-4 w-16 bg-neutral-200 rounded" /></td>
                  <td className="p-3 text-right pr-5"><div className="h-4 w-16 bg-neutral-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-neutral-400">
                  <p>No events recorded yet.</p>
                </td>
              </tr>
            ) : (
              currentData.map((event, i) => {
                const deviceStr = ((event.metadata as any)?.device || "unknown") as string;
                const DeviceIcon = DEVICE_ICONS[deviceStr.toLowerCase()] || Monitor;
                
                return (
                  <tr key={event.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="p-3 pl-5 text-neutral-400 text-xs">
                      {(page - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${EVENT_COLORS[event.event] || "bg-neutral-100 text-neutral-600"}`}>
                        {event.event}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono text-neutral-500 group-hover:text-violet-700 transition-colors">
                      {event.sessionId ? (event.sessionId.length > 8 ? `${event.sessionId.slice(0, 8)}...` : event.sessionId) : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 capitalize">
                        {deviceStr !== "unknown" && <DeviceIcon size={12} />}
                        {deviceStr}
                      </div>
                    </td>
                    <td className="p-3 text-right pr-5 text-xs text-neutral-400 flex items-center justify-end gap-1.5" title={event.timestamp?.toString()}>
                      <Clock size={12} /> {event.timestamp ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true }) : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredEvents.length > 0 && (
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-500 bg-neutral-50/30 rounded-b-xl">
          <span>Showing {Math.min(filteredEvents.length, (page - 1) * rowsPerPage + 1)} to {Math.min(filteredEvents.length, page * rowsPerPage)} of {filteredEvents.length} entries</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevPage} 
              disabled={page === 1}
              className="p-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <button 
              onClick={handleNextPage} 
              disabled={page === totalPages}
              className="p-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 flex items-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
