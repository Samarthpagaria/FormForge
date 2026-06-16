"use client";

import React, { useState } from "react";
import { X, Clock, Eye, RotateCcw, Loader2 } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { formatDistanceToNow } from "date-fns";
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
  const { data: versions, isLoading } = trpc.formVersions.getAll.useQuery({ formId });
  const [restoringId, setRestoringId] = useState<string | null>(null);
  
  const { mutate: rollback } = trpc.formVersions.rollback.useMutation({
    onSuccess: () => {
      toast.success("Form restored successfully!");
      onRestoreSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to restore version");
      setRestoringId(null);
    }
  });

  const handleRestore = (versionId: string) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200 flex flex-col gap-3 min-w-[300px]">
        <h3 className="text-sm font-bold text-neutral-800">Restore this version?</h3>
        <p className="text-xs text-neutral-500">This will create a new version with this older content.</p>
        <div className="flex justify-end gap-2 mt-1">
          <button 
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t);
              setRestoringId(versionId);
              rollback({ formId, versionId });
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            Confirm Restore
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[280px] bg-[#EDEDEA] border-l border-neutral-300 flex flex-col h-full shadow-2xl z-40 shrink-0"
    >
      <div className="h-14 border-b border-neutral-300 flex items-center justify-between px-4 bg-[#EDEDEA] shrink-0">
        <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          <Clock size={16} className="text-neutral-500" /> Version History
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/50 p-4 rounded-xl border border-neutral-200/50 animate-pulse h-24" />
          ))
        ) : !versions || versions.length === 0 ? (
          <div className="text-center p-6 text-neutral-500 text-sm">
            No history available.
          </div>
        ) : (
          versions.map((version, idx) => {
            const isCurrent = version.id === currentVersionId;
            const isPreviewing = version.id === previewingVersionId;
            const isOriginal = idx === versions.length - 1;
            const vNum = versions.length - idx;

            return (
              <div 
                key={version.id} 
                className={`relative bg-white p-4 rounded-xl border transition-all ${
                  isCurrent ? "border-violet-400 shadow-sm" : 
                  isPreviewing ? "border-neutral-400 shadow-md ring-2 ring-neutral-200" : 
                  "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 rounded-l-xl" />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-800">
                      v{vNum}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wide font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                    {isOriginal && !isCurrent && (
                      <span className="text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        Original
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium" title={new Date(version.createdAt as string).toLocaleString()}>
                    {formatDistanceToNow(new Date(version.createdAt as string), { addSuffix: true })}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 mb-4 line-clamp-1">
                  {isOriginal ? "Initial build" : "Auto-saved version"}
                </div>

                <div className="flex items-center gap-2">
                  {!isCurrent && (
                    <button 
                      onClick={() => onPreview(isPreviewing ? null : version)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        isPreviewing 
                          ? "bg-neutral-800 border-neutral-800 text-white hover:bg-neutral-700" 
                          : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <Eye size={14} /> {isPreviewing ? "Viewing" : "Preview"}
                    </button>
                  )}
                  
                  {!isCurrent && (
                    <button 
                      onClick={() => handleRestore(version.id)}
                      disabled={restoringId === version.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {restoringId === version.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      Restore
                    </button>
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
