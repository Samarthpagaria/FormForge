import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse p-1">
      {/* Generic Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="h-7 w-40 bg-neutral-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-56 bg-neutral-200 dark:bg-zinc-800 rounded-sm mt-3" />
        </div>
        <div className="h-9 w-32 bg-neutral-200 dark:bg-zinc-800 rounded-xl" />
      </div>

      <div className="space-y-6 mt-8">
        {/* Top Bento Blocks Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200/50 dark:bg-zinc-800/50 rounded-2xl border border-neutral-100 dark:border-zinc-800/80" />
          ))}
        </div>

        {/* Mid Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-neutral-200/50 dark:bg-zinc-800/50 rounded-3xl border border-neutral-100 dark:border-zinc-800/80" />
          <div className="lg:col-span-1 h-[300px] bg-neutral-200/50 dark:bg-zinc-800/50 rounded-3xl border border-neutral-100 dark:border-zinc-800/80" />
        </div>

        {/* Bottom Full-Width Skeleton */}
        <div className="h-[250px] bg-neutral-200/50 dark:bg-zinc-800/50 rounded-3xl border border-neutral-100 dark:border-zinc-800/80" />
      </div>
    </div>
  );
}
