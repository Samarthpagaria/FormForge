"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ArrowRight } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { Logo } from "@/components/logo";

/* ── Left: Logo ─────────────────────────── */
function NavLeft() {
  return (
    <div className="flex items-center">
      <Logo isLanding={true} />
    </div>
  );
}

/* ── Middle: Empty or Basic Links ───────── */
function NavMiddle() {
  // Empty for maximum cleanliness as per plan.
  return (
    <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
    </nav>
  );
}

/* ── Right: Theme, Github, and CTA ──────── */
function NavRight() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
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

      {/* CTA Button */}
      <div className="flex items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800 rounded-full p-1 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80">
        <button
          onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-in")}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer group"
          style={{
            background:
              "linear-gradient(120deg,#18181b,#52525b,#a1a1aa,#52525b,#18181b)",
            backgroundSize: "300% 300%",
            animation: "gradientShift 4s ease infinite",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <span className="relative flex items-center gap-1.5">
            {isLoaded ? (isSignedIn ? "Go to Dashboard" : "Sign In") : "Loading..."}
            <ArrowRight size={14} className="stroke-[2.5]" />
          </span>
        </button>
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
  );
}

/* ── Assembled Navbar ─────────────────────── */
export function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 pointer-events-none pt-4 transition-all duration-300">
      <div className="relative flex items-center justify-between h-full w-full mx-auto px-6 md:px-12 pointer-events-auto">
        <NavLeft />
        <NavMiddle />
        <NavRight />
      </div>
    </header>
  );
}
