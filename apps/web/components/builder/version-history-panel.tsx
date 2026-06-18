"use client";

import React, { useState } from "react";
import { X, Clock, Eye, RotateCcw, Loader2, Trash2 } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface VersionHistoryPanelProps {
  formId: string;
  currentVersionId: string;
  previewingVersionId: string | null;
  onClose: () => void;
  onPreview: (version: any) => void;
  onRestoreSuccess: () => void;
}

export function VersionHistoryPanel({ 
  formId, 
  currentVersionId, 
  previewingVersionId, 
  onClose, 
  onPreview,
  onRestoreSuccess
}: VersionHistoryPanelProps) {
  const utils = trpc.useUtils();
  const { data: versions, isLoading } = trpc.formVersions.getAll.useQuery({ formId });
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate: rollbackVersion } = trpc.formVersions.rollback.useMutation({
    onSuccess: () => {
      toast.success("Version restored successfully!");
      setRestoringId(null);
      onRestoreSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to restore version");
      setRestoringId(null);
    }
  });

  const { mutate: deleteVersion } = trpc.formVersions.deleteVersion.useMutation({
    onSuccess: () => {
      toast.success("Version deleted successfully!");
      utils.formVersions.getAll.invalidate({ formId });
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete version");
      setDeletingId(null);
    }
  });

  const handleRestore = (versionId: string) => {
    const confirmMsg = "Are you sure you want to restore this version? This will overwrite your current draft.";
    if (!window.confirm(confirmMsg)) return;

    setRestoringId(versionId);
    rollbackVersion({ formId, versionId });
  };

  const handleDelete = (versionId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this version?")) {
      setDeletingId(versionId);
      deleteVersion({ formId, versionId });
    }
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[280px] bg-[#EDEDEA] dark:bg-zinc-900 border-l border-neutral-300 dark:border-zinc-800 flex flex-col h-full shadow-2xl z-40 shrink-0"
    >
      <div className="h-14 border-b border-neutral-300 dark:border-zinc-800 flex items-center justify-between px-4 bg-[#EDEDEA] dark:bg-zinc-900 shrink-0">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-zinc-100 flex items-center gap-2">
          <Clock size={16} className="text-neutral-500" /> Version History
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-neutral-500 dark:text-zinc-400"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-neutral-200/50 dark:border-zinc-800/50 animate-pulse h-24" />
          ))
        ) : !versions || versions.length === 0 ? (
          <div className="text-center p-6 text-neutral-500 dark:text-zinc-500 text-sm">
            No history available.
          </div>
        ) : (
          versions.map((version, idx) => {
            const isCurrent = version.id === currentVersionId;
            const isPreviewing = version.id === previewingVersionId;
            const isOriginal = idx === versions.length - 1;

            return (
              <div 
                key={version.id} 
                className={`relative bg-white dark:bg-zinc-800 p-4 rounded-xl border transition-all ${
                  isCurrent ? "border-violet-400 dark:border-violet-600 shadow-sm" : 
                  isPreviewing ? "border-neutral-400 dark:border-zinc-500 shadow-md ring-2 ring-neutral-200 dark:ring-zinc-700" : 
                  "border-neutral-200 dark:border-zinc-700 hover:border-neutral-300 dark:hover:border-zinc-600 hover:shadow-sm"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 rounded-l-xl" />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-800 dark:text-zinc-100">
                      v{version.version}
                    </span>
                    {isCurrent ? (
                      <span className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Published
                      </span>
                    ) : (
                      <span className="flex-shrink-0 bg-neutral-100 dark:bg-zinc-700 text-neutral-500 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Unpublished
                      </span>
                    )}
                    {isOriginal && !isCurrent && (
                      <span className="text-[10px] uppercase tracking-wide font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                        Original
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-zinc-500 font-medium" title={new Date(version.createdAt as string).toLocaleString()}>
                    {format(new Date(version.createdAt as string), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
 
                <div className="text-xs text-neutral-500 dark:text-zinc-400 mb-4 line-clamp-1">
                  {isOriginal ? "Initial build" : "Auto-saved version"}
                </div>

                <div className="flex items-center gap-2">
                  {!isCurrent && (
                    <button 
                      onClick={() => onPreview(isPreviewing ? null : version)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        isPreviewing 
                          ? "bg-neutral-800 dark:bg-zinc-200 border-neutral-800 dark:border-zinc-200 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-zinc-300" 
                          : "bg-white dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <Eye size={14} /> {isPreviewing ? "Viewing" : "Preview"}
                    </button>
                  )}
                  
                  {!isCurrent && (
                    <>
                      <button 
                        onClick={() => handleRestore(version.id)}
                        disabled={restoringId === version.id || deletingId === version.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-violet-200 dark:border-violet-900/50 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {restoringId === version.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        Restore
                      </button>
                      <button 
                        onClick={() => handleDelete(version.id)}
                        disabled={deletingId === version.id || restoringId === version.id}
                        className="flex items-center justify-center p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        title="Delete version"
                      >
                        {deletingId === version.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
