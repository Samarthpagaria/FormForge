"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Plus, Loader2, Folder } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName: string;
  onSave: (name: string, categoryId?: string) => void;
  isSaving: boolean;
}

export function SaveTemplateModal({ isOpen, onClose, defaultName, onSave, isSaving }: SaveTemplateModalProps) {
  const [name, setName] = useState(defaultName);
  const [categoryId, setCategoryId] = useState<string>("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const utils = trpc.useUtils();
  const { data: categories, isLoading: loadingCategories } = trpc.templates.getAllCategories.useQuery(undefined, {
    enabled: isOpen,
  });

  const { mutate: createCategory, isPending: isCreatingCat } = trpc.templates.createCategory.useMutation({
    onSuccess: (newCat) => {
      toast.success("Category created!");
      if (newCat?.id) setCategoryId(newCat.id);
      setIsCreatingCategory(false);
      setNewCategoryName("");
      utils.templates.getAllCategories.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create category"),
  });

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setCategoryId("");
      setIsCreatingCategory(false);
      setNewCategoryName("");
    }
  }, [isOpen, defaultName]);

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategory({ name: newCategoryName.trim() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), categoryId || undefined);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-neutral-200/60 dark:border-zinc-800 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                <Save size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">Save as Template</h2>
                <p className="text-xs text-neutral-500 dark:text-zinc-400">Create a reusable template from this form</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 dark:text-zinc-500 hover:text-neutral-600 dark:hover:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 dark:text-zinc-200">Template Name</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Employee Feedback Survey"
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 dark:text-zinc-200">Category (Optional)</label>
              
              {isCreatingCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                    }}
                    placeholder="New category name..."
                    className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-neutral-400 dark:placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isCreatingCat || !newCategoryName.trim()}
                    className="p-2 bg-neutral-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {isCreatingCat ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="p-2 text-neutral-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Folder size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" />
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none"
                    >
                      <option value="">No Category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.isGlobal ? "(Global)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} /> New
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-500/20 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Template
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
