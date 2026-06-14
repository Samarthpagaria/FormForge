"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet, ChevronRight, Inbox } from "lucide-react";

export interface Submission {
  id: string;
  formName: string;
  respondent: string;
  device: "desktop" | "mobile" | "tablet";
  time: string;
  status: "Completed" | "Partial";
}

interface RecentSubmissionsProps {
  submissions: Submission[];
}

const DeviceIcon = ({ device }: { device: "desktop" | "mobile" | "tablet" }) => {
  switch (device) {
    case "desktop":
      return <Monitor size={14} className="text-neutral-400 dark:text-zinc-500" />;
    case "mobile":
      return <Smartphone size={14} className="text-neutral-400 dark:text-zinc-500" />;
    case "tablet":
      return <Tablet size={14} className="text-neutral-400 dark:text-zinc-500" />;
    default:
      return null;
  }
};

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  const visibleSubmissions = submissions.slice(0, 8);
  const isEmpty = submissions.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block">
            Recent Submissions
          </span>
          <p className="text-[10px] text-neutral-400 dark:text-zinc-500">
            Latest incoming user responses across all live forms
          </p>
        </div>
        {!isEmpty && (
          <button className="text-[10px] font-semibold text-neutral-800 dark:text-zinc-200 hover:text-neutral-950 dark:hover:text-white flex items-center gap-0.5 group">
            View all
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center select-none">
          <div className="text-neutral-300 dark:text-zinc-700 p-3 bg-neutral-100/50 dark:bg-zinc-800/30 rounded-full mb-3">
            <Inbox size={24} className="stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-neutral-600 dark:text-zinc-300">
            No submissions yet
          </span>
          <p className="text-[10px] text-neutral-400 dark:text-zinc-500 mt-1 max-w-[200px]">
            Share your form to start collecting customer responses.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/60 dark:border-zinc-850 text-neutral-400 dark:text-zinc-500 font-medium">
                <th className="py-2 px-3">Form Name</th>
                <th className="py-2 px-3">Respondent</th>
                <th className="py-2 px-3 text-center">Device</th>
                <th className="py-2 px-3">Date / Time</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleSubmissions.map((sub, idx) => (
                <tr
                  key={sub.id}
                  className={`border-b border-neutral-200/45 dark:border-zinc-850/40 hover:bg-neutral-100/40 dark:hover:bg-zinc-800/30 transition-colors duration-200 ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-neutral-100/20 dark:bg-zinc-800/10"
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-neutral-800 dark:text-zinc-200">
                    {sub.formName}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 dark:text-zinc-400">
                    {sub.respondent}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-center">
                      <DeviceIcon device={sub.device} />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 dark:text-zinc-500">
                    {sub.time}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        sub.status === "Completed"
                          ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 border-neutral-900 dark:border-neutral-200"
                          : "bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400 border-neutral-200 dark:border-zinc-850"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
