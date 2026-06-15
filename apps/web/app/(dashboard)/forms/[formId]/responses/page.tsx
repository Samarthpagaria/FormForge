"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Smartphone, 
  Download,
  ChevronLeft,
  ChevronRight,
  Monitor,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  ChevronDown
} from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motion, AnimatePresence } from "motion/react";

const DUMMY_FORMS_LIST = [
  { id: "1", name: "Customer Feedback 2026" },
  { id: "2", name: "Event Registration" },
  { id: "3", name: "Job Application" },
  { id: "4", name: "Q3 Employee Survey" },
];

const DUMMY_SUBMISSIONS = [
  { id: "sub_1", formId: "1", formName: "Customer Feedback 2026", submitter: "John Doe", email: "john@example.com", device: "Desktop", time: "45s", status: "Complete", submittedAt: "2 hours ago", message: "Great form, easy to use!" },
  { id: "sub_2", formId: "1", formName: "Customer Feedback 2026", submitter: "Sarah Smith", email: "sarah@example.com", device: "Mobile", time: "1m 20s", status: "Complete", submittedAt: "5 hours ago", message: "Loved the UI." },
  { id: "sub_3", formId: "2", formName: "Event Registration", submitter: "Mike Johnson", email: "mike@example.com", device: "Mobile", time: "30s", status: "Partial", submittedAt: "1 day ago", message: "" },
  { id: "sub_4", formId: "3", formName: "Job Application", submitter: "Emma Davis", email: "emma@example.com", device: "Desktop", time: "2m 10s", status: "Complete", submittedAt: "2 days ago", message: "Found a minor typo on page 2." },
  { id: "sub_5", formId: "4", formName: "Q3 Employee Survey", submitter: "Alex Wilson", email: "alex@example.com", device: "Tablet", time: "15s", status: "Partial", submittedAt: "3 days ago", message: "" },
  { id: "sub_6", formId: "2", formName: "Event Registration", submitter: "Chris Lee", email: "chris@example.com", device: "Desktop", time: "4m", status: "Complete", submittedAt: "4 days ago", message: "Attending with +1" },
];

export default function ResponsesPage() {
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
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

  const filteredSubmissions = useMemo(() => {
    return DUMMY_SUBMISSIONS.filter(sub => {
      const matchesForm = selectedForms.length === 0 || selectedForms.includes(sub.formId);
      const searchLower = search.toLowerCase();
      const matchesSearch = search === "" || 
                            sub.submitter.toLowerCase().includes(searchLower) || 
                            sub.email.toLowerCase().includes(searchLower) || 
                            sub.formName.toLowerCase().includes(searchLower) ||
                            sub.message.toLowerCase().includes(searchLower);
      return matchesForm && matchesSearch;
    });
  }, [search, selectedForms]);

  const activeSub = DUMMY_SUBMISSIONS.find(s => s.id === selectedSub);

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
              <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">All Responses</h1>
              <p className="text-neutral-500 text-sm mt-0.5">{filteredSubmissions.length} total responses</p>
            </div>
          </div>
          
          <ShinyButton className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium">
            <Download size={16} /> Export CSV
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
                  placeholder="Search table content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-neutral-200 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d351e]/20 transition-all shadow-sm"
                />
              </div>

              {/* Multi-Select Forms Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-full text-sm hover:bg-neutral-50 transition-colors shadow-sm font-medium"
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

            </div>

            {/* Table Content */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-neutral-50/50 border-b border-neutral-200/60 text-neutral-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">#</th>
                    <th className="px-6 py-4 font-semibold">Form</th>
                    <th className="px-6 py-4 font-semibold">Submitter</th>
                    <th className="px-6 py-4 font-semibold">Device</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        No responses found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub, idx) => (
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
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                            {sub.formName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-800">{sub.submitter}</div>
                          <div className="text-xs text-neutral-400">{sub.submittedAt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            {sub.device === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                            {sub.device}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600">{sub.time}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                            sub.status === 'Complete' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {sub.status === 'Complete' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {sub.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-neutral-200/60 p-4 bg-white/50 flex items-center justify-between text-sm text-neutral-500 rounded-b-[2rem]">
              <button className="flex items-center gap-1 hover:text-neutral-800 transition-colors font-medium">
                <ChevronLeft size={16} /> Prev
              </button>
              <span>Page 1 of 3</span>
              <button className="flex items-center gap-1 hover:text-neutral-800 transition-colors font-medium">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Side Panel (Submission Details) */}
          <AnimatePresence mode="popLayout">
            {selectedSub && activeSub && (
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
                    <p className="text-xs text-neutral-500 mt-1">Form: <span className="font-semibold">{activeSub.formName}</span></p>
                  </div>
                  <button 
                    onClick={() => setSelectedSub(null)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Submitted</p>
                        <p className="text-sm font-semibold text-neutral-700">{activeSub.submittedAt}</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">Device</p>
                        <p className="text-sm font-semibold text-neutral-700">{activeSub.device}</p>
                      </div>
                    </div>

                    <div className="w-full h-px bg-neutral-100" />

                    <div>
                      <p className="text-xs font-semibold text-neutral-400 mb-2">Full Name</p>
                      <p className="text-sm text-neutral-800 bg-white border border-neutral-200 px-3 py-2 rounded-lg">{activeSub.submitter}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-neutral-400 mb-2">Email Address</p>
                      <p className="text-sm text-neutral-800 bg-white border border-neutral-200 px-3 py-2 rounded-lg">{activeSub.email}</p>
                    </div>

                    {activeSub.message && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-400 mb-2">Message</p>
                        <div className="text-sm text-neutral-800 bg-white border border-neutral-200 px-3 py-2 rounded-lg min-h-[100px]">
                          {activeSub.message}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
