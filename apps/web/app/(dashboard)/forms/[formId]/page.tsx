"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/src/trpc/client";
import { toast } from "sonner";
import { 
  ArrowLeft, Edit3, BarChart2, MessageSquare, Share2, Eye, 
  Settings, Trash2, Globe, Lock, Clock, Monitor, Smartphone, Tablet, Loader2,
  AlertTriangle
} from "lucide-react";

function timeAgo(dateInput: string | Date) {
  if (!dateInput) return "Unknown";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function FormOverviewPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = React.use(params);
  const router = useRouter();
  const utils = trpc.useUtils();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Queries
  const { data: form, isLoading: loadingForm } = trpc.forms.getById.useQuery({ id: formId });
  const { data: stats, isLoading: loadingStats } = trpc.analytics.getSummary.useQuery({ formId });
  const { data: responses, isLoading: loadingResponses } = trpc.responses.getAll.useQuery({ formId });

  // Mutations
  const { mutate: deleteForm, isPending: isDeleting } = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.forms.getAllForms.invalidate();
      router.push("/forms");
    },
    onError: (err) => toast.error(err.message || "Failed to delete form"),
  });

  const { mutate: publish, isPending: isPublishing } = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to publish form"),
  });
  
  const { mutate: unpublish, isPending: isUnpublishing } = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished.");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (err) => toast.error(err.message || "Failed to unpublish form"),
  });

  if (loadingForm) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-[#f5f5f3] dark:bg-zinc-950">
        <Loader2 className="animate-spin text-neutral-400 dark:text-zinc-500" size={32} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center bg-[#f5f5f3] dark:bg-zinc-950">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-zinc-200">Form not found</h2>
        <Link href="/forms" className="mt-4 text-violet-600 dark:text-violet-400 hover:underline">Return to forms</Link>
      </div>
    );
  }

  const isPublished = form.status === "published";
  const settings = (form.settings as Record<string, any>) || {};
  const displayMode = settings.displayMode || "Normal";
  const allowMultiple = settings.allowMultipleSubmissions !== false;
  
  const togglePublish = () => {
    if (isPublished) unpublish({ id: formId });
    else publish({ id: formId });
  };

  const recentResponses = responses ? responses.slice(0, 3) : [];

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#f5f5f3] dark:bg-zinc-950 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/forms" className="text-sm font-medium text-neutral-500 dark:text-zinc-400 hover:text-neutral-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 w-fit mb-2">
              <ArrowLeft size={16} /> Back to forms
            </Link>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
              {form.name}
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-400" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-400"}`}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 font-medium mt-1">
              Last edited {form.updatedAt ? timeAgo(form.updatedAt) : "recently"}
            </p>
          </div>

          {/* Quick Publish Toggle */}
          <button 
            onClick={togglePublish}
            disabled={isPublishing || isUnpublishing}
            className={`text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${isPublished ? "bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800/50" : "bg-violet-600 border border-violet-600 text-white hover:bg-violet-700"}`}
          >
            {(isPublishing || isUnpublishing) ? <Loader2 size={16} className="animate-spin" /> : (isPublished ? <Lock size={16} /> : <Globe size={16} />)}
            {isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>

        {/* NAVIGATION ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <ActionCard icon={Edit3} label="Edit / Builder" href={`/forms/${formId}/builder`} color="text-blue-500" />
          <ActionCard icon={BarChart2} label="Analytics" href={`/forms/${formId}/analytics`} color="text-violet-500" />
          <ActionCard icon={MessageSquare} label="Responses" href={`/forms/${formId}/responses`} color="text-emerald-500" count={responses?.length} />
          <ActionCard icon={Share2} label="Share" href={`/forms/${formId}/share`} color="text-pink-500" />
          <ActionCard icon={Eye} label="Preview" href={`/f/${form.slug}`} color="text-amber-500" target="_blank" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* STATS */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-base font-bold text-neutral-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
                <BarChart2 size={18} className="text-neutral-400 dark:text-zinc-500" /> Quick Stats
              </h2>
              <div className="grid grid-cols-3 gap-4 divide-x divide-neutral-100 dark:divide-zinc-800">
                <div className="flex flex-col gap-1 px-4 first:pl-0">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Views</p>
                  <p className="text-3xl font-black text-neutral-900 dark:text-zinc-50">{loadingStats ? "-" : (stats?.views || 0)}</p>
                </div>
                <div className="flex flex-col gap-1 px-4">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Starts</p>
                  <p className="text-3xl font-black text-neutral-900 dark:text-zinc-50">{loadingStats ? "-" : (stats?.starts || 0)}</p>
                </div>
                <div className="flex flex-col gap-1 px-4">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Submits</p>
                  <p className="text-3xl font-black text-neutral-900 dark:text-zinc-50">{loadingStats ? "-" : (stats?.submissions || 0)}</p>
                </div>
              </div>
            </div>

            {/* RECENT SUBMISSIONS */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-800 dark:text-zinc-200 flex items-center gap-2">
                  <Clock size={18} className="text-neutral-400 dark:text-zinc-500" /> Recent Submissions
                </h2>
                {responses && responses.length > 3 && (
                  <Link href={`/forms/${formId}/responses`} className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
                    View all
                  </Link>
                )}
              </div>
              
              <div className="flex flex-col divide-y divide-neutral-100 dark:divide-zinc-800">
                {loadingResponses ? (
                  <div className="p-6 text-center text-sm text-neutral-500 dark:text-zinc-400 animate-pulse flex items-center gap-2 justify-center">
                    <Loader2 size={16} className="animate-spin" /> Loading submissions...
                  </div>
                ) : recentResponses.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                    <MessageSquare size={32} className="text-neutral-300 dark:text-zinc-700" />
                    <p className="text-sm font-medium text-neutral-500 dark:text-zinc-400">No submissions yet.</p>
                  </div>
                ) : (
                  recentResponses.map((res) => {
                    const device = (res.meta as any)?.device || "desktop";
                    const DeviceIcon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;
                    return (
                      <div key={res.id} className="p-4 px-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center border border-violet-100 dark:border-violet-800/50 text-violet-600 dark:text-violet-400 shrink-0">
                            <span className="text-sm font-bold uppercase">{res.id.substring(0, 2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-neutral-800 dark:text-zinc-200 font-mono">{res.id.substring(0, 8)}...</p>
                            <p className="text-xs text-neutral-500 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                              {timeAgo(res.submittedAt as any)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-[11px] font-bold text-neutral-500 dark:text-zinc-400 bg-neutral-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wide">
                            <DeviceIcon size={12} /> <span className="capitalize">{device}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* DETAILS */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-sm p-6">
              <h2 className="text-base font-bold text-neutral-800 dark:text-zinc-200 mb-5 flex items-center gap-2">
                <Settings size={18} className="text-neutral-400 dark:text-zinc-500" /> Form Details
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Slug</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-zinc-200 bg-neutral-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-neutral-100 dark:border-zinc-800 font-mono truncate" title={form.slug}>
                    {form.slug}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">Created</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-zinc-200">
                    {form.createdAt ? new Date(form.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
                  </span>
                </div>
                <div className="h-px bg-neutral-100 dark:bg-zinc-800 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600 dark:text-zinc-400">Display Mode</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-zinc-50 capitalize">{displayMode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600 dark:text-zinc-400">Multiple Submits</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-zinc-50">{allowMultiple ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50 shadow-sm p-6">
              <h2 className="text-base font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Danger Zone
              </h2>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4 font-medium leading-relaxed">
                Deleting this form will permanently remove all of its versions and submissions. This action cannot be undone.
              </p>
              
              {showDeleteConfirm ? (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => deleteForm({ id: formId })}
                    disabled={isDeleting}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    Confirm Delete
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full py-2.5 bg-white dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 rounded-xl border border-neutral-200 dark:border-zinc-800 text-sm font-bold hover:bg-neutral-50 dark:hover:bg-zinc-800/50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 text-sm font-bold hover:bg-red-50 dark:hover:bg-zinc-800/50 shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> Delete Form
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, href, color, count, target }: { icon: any, label: string, href: string, color: string, count?: number, target?: string }) {
  return (
    <Link href={href} target={target}>
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 items-center justify-center hover:bg-neutral-50 dark:hover:bg-zinc-800/50 hover:border-violet-300 dark:hover:border-violet-700 transition-all shadow-sm group cursor-pointer relative h-24">
        {count !== undefined && count > 0 && (
          <span className="absolute top-2 right-2 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-neutral-200 dark:border-zinc-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-700 dark:group-hover:text-violet-400 group-hover:border-violet-200 dark:group-hover:border-violet-800/50 transition-colors">
            {count}
          </span>
        )}
        <div className={`p-2 rounded-xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-100 dark:border-zinc-800 group-hover:scale-110 transition-transform ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300">{label}</span>
      </div>
    </Link>
  );
}
