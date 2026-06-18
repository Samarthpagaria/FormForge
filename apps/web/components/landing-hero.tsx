"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, LayoutGrid, ShieldCheck, History } from "lucide-react";
import DisplayCards from "@/components/ui/display-cards";
import { ThreeDMarqueeDemo } from "@/components/3d-marquee-demo";

interface DynamicWordInfo {
  word: string;
  gradientClass: string;
}

const DYNAMIC_WORDS: DynamicWordInfo[] = [
  { word: "Noise", gradientClass: "from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400" },
  { word: "Friction", gradientClass: "from-orange-500 via-amber-500 to-rose-500 dark:from-orange-400 dark:via-amber-400 dark:to-rose-400" },
  { word: "Chaos", gradientClass: "from-violet-500 via-purple-500 to-indigo-500 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400" },
  { word: "Overhead", gradientClass: "from-blue-500 via-sky-500 to-indigo-500 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400" },
  { word: "Limits", gradientClass: "from-rose-500 via-pink-500 to-red-500 dark:from-rose-400 dark:via-pink-400 dark:to-red-400" },
];

export function LandingHero() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % DYNAMIC_WORDS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    router.push(isSignedIn ? "/dashboard" : "/sign-up");
  };

  const handleWatchDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  const activeWord = DYNAMIC_WORDS[wordIndex]!;

  const cards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
      title: "7 Display Modes",
      description: "One form, many experiences",
      date: "Customization",
      icon: <LayoutGrid className="size-4 stroke-[2] text-violet-500" />,
    },
    {
      className: "[grid-area:stack] translate-x-12 translate-y-8 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
      title: "Smart Protection",
      description: "No duplicate submissions",
      date: "Security",
      icon: <ShieldCheck className="size-4 stroke-[2] text-emerald-500" />,
    },
    {
      className: "[grid-area:stack] translate-x-24 translate-y-16 hover:translate-y-8",
      title: "Full History",
      description: "Rollback anytime to any version",
      date: "Versioning",
      icon: <History className="size-4 stroke-[2] text-blue-500" />,
    },
  ];

  return (
    <section className="relative w-full h-screen flex items-center justify-between pt-16 px-2 sm:px-12 md:px-12 lg:px-16 xl:px-24 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-violet-400/5 dark:bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="ml-24 max-w-[88rem] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="lg:col-span-7 flex flex-col justify-center items-start text-left h-full lg:-translate-x-4 xl:-translate-x-8"
        >
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-[1.15] min-h-[130px] sm:min-h-[155px] md:min-h-[180px] lg:min-h-[210px]"
          >
            Collect data.
            <br />
            Without the{" "}
            <span className="relative inline-block mt-1 sm:mt-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWord.word}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className={`bg-clip-text text-transparent bg-gradient-to-r ${activeWord.gradientClass}`}
                >
                  {activeWord.word}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
            }}
            className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-zinc-400 mb-5 max-w-xl leading-relaxed"
          >
            Seven ways to present a single form. Built-in analytics, version history, and submission integrity without the bloat of legacy form builders.
          </motion.p>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
            }}
            className="flex flex-wrap items-center gap-3 w-full sm:w-auto"
          >
            <button
              onClick={handleGetStarted}
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto group"
              style={{
                background: "linear-gradient(120deg,#18181b,#52525b,#a1a1aa,#52525b,#18181b)",
                backgroundSize: "300% 300%",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center gap-2">
                {isLoaded ? (isSignedIn ? "Go to Dashboard" : "Get Started") : "Loading..."}
                <ArrowRight size={14} className="stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </button>

            <button
              onClick={handleWatchDemo}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-md hover:bg-neutral-100/80 dark:hover:bg-zinc-800/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm w-full sm:w-auto text-center cursor-pointer"
            >
              <Play size={12} className="fill-current" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
        className="lg:absolute lg:top-[110px] lg:right-40 z-20 flex justify-center lg:justify-end items-start relative mt-16 lg:mt-0 pb-16 lg:pb-0 pointer-events-none w-full lg:w-auto"
      >
        <div className="pointer-events-auto origin-top lg:origin-top-right scale-50 lg:scale-[0.55] xl:scale-[0.75] 2xl:scale-90">
          <DisplayCards cards={cards} />
        </div>
      </motion.div>

      <div className="hidden lg:block absolute -bottom-16 -right-16 xl:-bottom-8 xl:-right-8 2xl:bottom-0 2xl:right-0 z-0 pointer-events-none scale-[0.35] lg:scale-[0.35] xl:scale-[0.5] 2xl:scale-[0.65] origin-bottom-right">
        <div className="pointer-events-auto">
          <ThreeDMarqueeDemo />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
      `}</style>
    </section>
  );
}
