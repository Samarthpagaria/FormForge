import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
  initialName: string;
  initialDesc: string;
}

export function TemplateDetailsModal({ isOpen, onClose, templateId, initialName, initialDesc }: TemplateDetailsModalProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDesc(initialDesc);
    }
  }, [isOpen, initialName, initialDesc]);

  const { mutate: createFromTemplate, isPending, error } = trpc.templates.createFormFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Form created from template!");
      onClose();
      router.push(`/forms/${data.id}/builder`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.warning("Please enter a form name.");
      return;
    }
    if (templateId) {
      createFromTemplate({ templateId, name: name.trim(), description: desc.trim() });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-zinc-100 mb-1">Use Template</h2>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 mb-6">Give your form a name and description before starting.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-zinc-300 mb-1.5">
                  Form name <span className="text-neutral-400 dark:text-zinc-500 font-normal">(required)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Feedback"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm text-neutral-900 dark:text-zinc-100 placeholder-neutral-300 dark:placeholder-zinc-600 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-neutral-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-zinc-300 mb-1.5">
                  Description <span className="text-neutral-400 dark:text-zinc-500 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this form for?"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-sm text-neutral-900 dark:text-zinc-100 placeholder-neutral-300 dark:placeholder-zinc-600 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-neutral-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-800 transition-all duration-200 resize-none"
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-500">
                  {error.message}
                </p>
              )}

              <button
                disabled={!name.trim() || isPending}
                onClick={handleSubmit}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {isPending ? "Creating..." : "Create Form"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
