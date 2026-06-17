"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { trpc } from "@/src/trpc/client";
import { cx } from "@/lib/utils/cx";

const VOTED_KEY = "formforge_upvoted";

export function UpvoteCounter() {
  const [hasVoted, setHasVoted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data, refetch } = trpc.site.getUpvoteCount.useQuery(undefined, {
    staleTime: 30_000,
  });

  const increment = trpc.site.incrementUpvote.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    setMounted(true);
    setHasVoted(localStorage.getItem(VOTED_KEY) === "true");
  }, []);

  const handleUpvote = () => {
    if (hasVoted || increment.isPending) return;
    increment.mutate(undefined, {
      onSuccess: () => {
        localStorage.setItem(VOTED_KEY, "true");
        setHasVoted(true);
      },
    });
  };

  const count = data?.count ?? 0;

  return (
    <button
      type="button"
      onClick={handleUpvote}
      disabled={!mounted || hasVoted || increment.isPending}
      title={hasVoted ? "Thanks for your upvote!" : "Upvote FormForge"}
      className={cx(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        "bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-neutral-200/60 dark:border-zinc-800 shadow-sm",
        hasVoted
          ? "text-emerald-600 dark:text-emerald-400 cursor-default"
          : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80 cursor-pointer",
      )}
    >
      <ChevronUp
        className={cx(
          "size-3.5 stroke-[2.5] transition-transform",
          !hasVoted && "group-hover:-translate-y-0.5",
          hasVoted && "text-emerald-500",
        )}
      />
      <span className="text-neutral-500 dark:text-zinc-500 font-medium">Up Votes</span>
      <span className="tabular-nums text-neutral-900 dark:text-zinc-100">
        {mounted ? count.toLocaleString() : "—"}
      </span>
    </button>
  );
}
