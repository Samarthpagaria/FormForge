"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ArrowRight, ChevronUp } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Logo } from "@/components/logo";
import { trpc } from "@/src/trpc/client";
import { cx } from "@/lib/utils/cx";
import { toast } from "sonner";

const VOTED_KEY = "formforge_upvoted";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Why Us", href: "#why-choose-us" },
  { label: "Demo", href: "#demo" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "/docs" },
] as const;

const pillShell =
  "flex h-10 items-center rounded-full border border-neutral-200/60 bg-white/50 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50";

const iconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

function NavUpvote() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { data, refetch } = trpc.site.getUpvoteCount.useQuery(undefined, { staleTime: 30_000 });
  const increment = trpc.site.incrementUpvote.useMutation({ onSuccess: () => refetch() });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (data?.count !== undefined) setCount(data.count);
  }, [data?.count]);

  const handleUpvote = () => {
    setCount((prev) => prev + 1);
    increment.mutate(undefined, {
      onError: () => {
        setCount((prev) => prev - 1);
        toast.error("Failed to upvote. Please try again.");
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleUpvote}
      className={cx(iconBtn, "gap-1 px-2 w-auto", !mounted && "opacity-0 pointer-events-none")}
    >
      <ChevronUp className="size-4 stroke-[2.5]" />
      <span className="text-[11px] font-semibold text-neutral-500 dark:text-zinc-500">Upvote</span>
      <span className="min-w-[1ch] text-xs font-bold tabular-nums text-neutral-900 dark:text-zinc-100">
        {mounted ? count.toLocaleString() : "0"}
      </span>
    </button>
  );
}

export function LandingNavbar() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-20 pt-4 transition-all duration-300">
      <div className="pointer-events-auto relative mx-auto flex h-full w-full items-center justify-between gap-3 px-4 md:px-10 lg:px-12">
        <div className={pillShell}>
          <div className="flex h-full items-center px-3">
            <Logo isLanding href="/" />
          </div>
        </div>

        <nav className={cx(pillShell, "absolute left-1/2 hidden -translate-x-1/2 px-1 md:flex")}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isRoute = href.startsWith("/");
            const className =
              "flex h-8 items-center rounded-full px-3.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100";
            return isRoute ? (
              <Link key={href} href={href} className={className}>
                {label}
              </Link>
            ) : (
              <a key={href} href={href} className={className}>
                {label}
              </a>
            );
          })}
        </nav>

        <div className={cx(pillShell, "gap-0.5 px-1")}>
          <NavUpvote />
          <div className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-zinc-700" />
          <a
            href="https://github.com/Samarthpagaria/FormForge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FormForge on GitHub"
            className={iconBtn}
          >
            <Github size={17} />
          </a>
          <div className={iconBtn}>
            {mounted ? (
              <AnimatedThemeToggler
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onThemeChange={setTheme}
              />
            ) : (
              <span className="size-4" />
            )}
          </div>
          <div className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-zinc-700" />
          <button
            type="button"
            onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")}
            className="relative ml-0.5 flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-3.5 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(120deg,#18181b,#52525b,#a1a1aa,#52525b,#18181b)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            <span>Sign In</span>
            <ArrowRight size={13} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
      `}</style>
    </header>
  );
}
