"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ExpandableTabs, TabItem } from "@/components/ui/expandable-tabs";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  LayoutDashboard,
  FileText,
  Layout,
  LineChart,
  Inbox,
  BookOpen,
  Plus,
} from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Logo } from "@/components/logo";

/* ── Left: Logo ─────────────────────────── */
function NavLeft() {
  return (
    <div className="flex items-center">
      <Logo />
    </div>
  );
}

/* ── Middle: Navigation tabs ────────────── */
const tabs: TabItem[] = [
  { title: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { title: "Forms",     href: "/forms",      icon: FileText },
  { title: "Templates", href: "/templates",  icon: Layout },
  { title: "Analytics", href: "/analytics",  icon: LineChart },
  { title: "Responses", href: "/responses",  icon: Inbox },
  { title: "Docs",      href: "/docs",       icon: BookOpen },
];

function NavMiddle() {
  return (
    <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
      <ExpandableTabs tabs={tabs} className="rounded-full py-1.5 px-1.5 gap-1 h-12" />
    </nav>
  );
}

/* ── Right: New Form + User ──────────────── */
function NavRight() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggler & Github Button */}
      <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800 rounded-full p-1 shadow-sm">
        <a
          href="https://github.com/Samarthpagaria/FormForge"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Github size={18} />
        </a>
        <div className="flex items-center justify-center h-8 w-8 rounded-full">
          {mounted ? (
            <AnimatedThemeToggler
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              onThemeChange={setTheme}
            />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Main NavRight Content */}
      <div className="flex items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800 rounded-full p-1 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
        <button
          onClick={() => router.push("/create-form")}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          style={{
            background:
              "linear-gradient(120deg,#18181b,#52525b,#a1a1aa,#52525b,#18181b)",
            backgroundSize: "300% 300%",
            animation: "gradientShift 4s ease infinite",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <span className="relative flex items-center gap-1.5">
            <Plus size={14} className="stroke-[2.5]" />
            New Form
          </span>
        </button>

        <div className="w-px h-6 bg-neutral-200/80 dark:bg-zinc-700 mx-2" />

        <div className="flex items-center gap-2 pl-2 pr-1">
          <div className="hidden sm:flex flex-col items-end mr-1">
            {isLoaded && user ? (
              <>
                <span className="text-sm font-bold text-neutral-800 dark:text-zinc-100 tracking-tight leading-tight">
                  {user.fullName || user.firstName || "User"}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-zinc-400 font-semibold leading-tight tracking-wide">
                  {user.primaryEmailAddress?.emailAddress || ""}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <div className="w-20 h-3.5 bg-neutral-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-24 h-2.5 bg-neutral-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/50 dark:border-zinc-700 p-[1px] bg-white dark:bg-zinc-900">
            <UserButton
              appearance={{ elements: { avatarBox: "h-7 w-7 rounded-full" } }}
            />
          </div>
        </div>

        {/* Gradient animation keyframes */}
        <style jsx>{`
          @keyframes gradientShift {
            0%   { background-position: 0% 50%;   }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%;   }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ── Assembled Navbar ─────────────────────── */
export function DashboardNavbar() {
  const lastScrollY = useRef(0);
  const [hidden, setHidden] = useState(false);

  // Raw motion value for Y, then spring-smooth it
  const rawY = useMotionValue(0);
  const y = useSpring(rawY, { stiffness: 180, damping: 28, mass: 0.6 });

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const diff = current - lastScrollY.current;

      if (current < 10) {
        // Always show near the top
        setHidden(false);
      } else if (diff > 4) {
        // Scrolling DOWN — hide
        setHidden(true);
      } else if (diff < -4) {
        // Scrolling UP — show
        setHidden(false);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drive the spring: hidden → -72px (offscreen), visible → 0px
  useEffect(() => {
    rawY.set(hidden ? -72 : 0);
  }, [hidden, rawY]);

  return (
    <motion.header
      style={{ y }}
      className="fixed top-0 left-0 right-0 z-50 h-16 pointer-events-none"
    >
      <div className="relative flex items-center justify-between h-full w-full px-6 pointer-events-auto">
        <NavLeft />
        <NavMiddle />
        <NavRight />
      </div>
    </motion.header>
  );
}

