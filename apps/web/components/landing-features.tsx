"use client";

import React from "react";
import type { FC, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  LayoutTemplate,
  GitBranch,
  CalendarClock,
  ShieldCheck,
  BellRing,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/lib/utils/cx";

const iconColors: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  violet: "text-violet-600 dark:text-violet-400",
  blue: "text-blue-600 dark:text-blue-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
};

interface FeaturedIconProps {
  icon: LucideIcon;
  color: string;
}

const FeaturedIcon: FC<FeaturedIconProps> = ({ icon: Icon, color }) => (
  <Icon className={cx("mb-5 size-8 stroke-[1.75]", iconColors[color] || iconColors.violet)} />
);

interface CheckItemTextProps {
  boldText: string;
  text: string;
  color: string;
}

const CheckItemText: FC<CheckItemTextProps> = ({ boldText, text, color }) => (
  <li className="flex items-start gap-3 text-neutral-600 dark:text-zinc-450 text-sm leading-relaxed">
    <CheckCircle2 className={cx("mt-0.5 size-4 shrink-0 stroke-[2]", iconColors[color] || iconColors.violet)} />
    <div>
      <strong className="font-semibold text-neutral-800 dark:text-zinc-200">{boldText}</strong>
      <span className="mx-1.5 opacity-40">•</span>
      <span>{text}</span>
    </div>
  </li>
);

const AlternateImageMockup: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div
      className={cx(
        "size-full rounded-[9.03px] bg-white dark:bg-zinc-900 p-[0.9px] shadow-md border border-neutral-200/60 dark:border-zinc-800 md:rounded-[20.08px] md:p-0.5 lg:absolute lg:w-auto lg:max-w-none",
        props.className,
      )}
    >
      <div className="size-full rounded-[7.9px] bg-white dark:bg-zinc-950 p-0.5 md:rounded-[17.57px] md:p-[3.5px] border border-neutral-100 dark:border-zinc-850">
        <div className="relative size-full overflow-hidden rounded-[6.77px] border border-neutral-200/50 dark:border-zinc-800/50">
          {props.children}
        </div>
      </div>
    </div>
  );
};

interface FeatureItem {
  icon: LucideIcon;
  label: string;
  color: string;
  titlePart1: string;
  titleHighlight: string;
  titlePart2: string;
  gradientClass: string;
  description: string;
  bullets: { bold: string; text: string }[];
}

const FEATURES: FeatureItem[] = [
  {
    icon: Share2,
    label: "SHARING",
    color: "emerald",
    titlePart1: "Share anywhere, ",
    titleHighlight: "instantly",
    titlePart2: ".",
    gradientClass: "from-emerald-500 to-teal-500 dark:from-emerald-450 dark:to-teal-450",
    description: "Every form gets a clean public URL and an auto-generated QR code. Print it, embed it, or drop it in a link with no extra setup required.",
    bullets: [
      { bold: "Print-ready", text: "Generate high-resolution printable QR codes instantly." },
      { bold: "Short links", text: "Share clean, branded URLs with custom slugs." },
      { bold: "Embeddable", text: "Drop responsive forms on any website in seconds." },
    ],
  },
  {
    icon: LayoutTemplate,
    label: "TEMPLATES",
    color: "cyan",
    titlePart1: "Skip the ",
    titleHighlight: "blank page",
    titlePart2: ".",
    gradientClass: "from-cyan-500 to-teal-500 dark:from-cyan-450 dark:to-teal-450",
    description: "Start from a library of ready-made templates across feedback, events, education, and more, or save your own as a custom template for next time.",
    bullets: [
      { bold: "10+ layouts", text: "Access templates for surveys, registration, and leads." },
      { bold: "Team sharing", text: "Save any form draft as a reusable library item." },
      { bold: "One-click build", text: "Launch themes, colors, and field layouts in a tap." },
    ],
  },
  {
    icon: GitBranch,
    label: "VERSION CONTROL",
    color: "blue",
    titlePart1: "Every edit, ",
    titleHighlight: "remembered",
    titlePart2: ".",
    gradientClass: "from-blue-500 to-sky-550 dark:from-blue-450 dark:to-sky-450",
    description: "FormForge saves a new version automatically as you build. Preview any past version and roll back instantly. Nothing is ever truly lost.",
    bullets: [
      { bold: "Autosave drafts", text: "Secure, incremental history snapshots of your schemas." },
      { bold: "Live previews", text: "Compare diffs side-by-side between past versions." },
      { bold: "Safe rollback", text: "Roll back instantly with database schema protection." },
    ],
  },
  {
    icon: CalendarClock,
    label: "AUTOMATION",
    color: "amber",
    titlePart1: "Forms that ",
    titleHighlight: "open and close",
    titlePart2: " themselves.",
    gradientClass: "from-amber-500 to-orange-500 dark:from-amber-450 dark:to-orange-450",
    description: "Schedule exactly when a form goes live and when it shuts down. Set it once, and let FormForge handle the rest with no manual toggling.",
    bullets: [
      { bold: "Timer locks", text: "Configure precise publishing and closing schedules." },
      { bold: "Custom notices", text: "Customize messages for visitors who arrive late." },
      { bold: "Timezone sync", text: "Run automated schedules relative to target regions." },
    ],
  },
  {
    icon: ShieldCheck,
    label: "INTEGRITY",
    color: "rose",
    titlePart1: "You decide who responds, and ",
    titleHighlight: "how often",
    titlePart2: ".",
    gradientClass: "from-rose-500 to-pink-500 dark:from-rose-450 dark:to-pink-450",
    description: "Restrict forms to one response per person using IP detection, or open them up for unlimited submissions. The choice is yours, per form.",
    bullets: [
      { bold: "Spam block", text: "Prevent duplication using IP and cookie tracking." },
      { bold: "White-listing", text: "Confine response access to specific emails or domains." },
      { bold: "Flexible limits", text: "Toggle response frequency rules per form configuration." },
    ],
  },
  {
    icon: BellRing,
    label: "NOTIFICATIONS",
    color: "indigo",
    titlePart1: "Know the ",
    titleHighlight: "exact moment",
    titlePart2: " someone responds.",
    gradientClass: "from-indigo-500 to-sky-550 dark:from-indigo-450 dark:to-sky-450",
    description: "Get a clean, branded email the instant a new submission comes in, complete with every answer, ready to read without logging in.",
    bullets: [
      { bold: "Instant alerts", text: "Real-time notifications sent directly to your inbox." },
      { bold: "Mobile layouts", text: "Perfect email formats readable on any device screen." },
      { bold: "Data attached", text: "Review responses and file upload attachments inline." },
    ],
  },
];

export const FeaturesAlternatingLayout01 = () => {
  return (
    <section id="features" className="flex flex-col gap-12 overflow-hidden bg-[#f5f5f3] dark:bg-[#09090b] py-16 sm:gap-16 md:gap-20 md:py-24 lg:gap-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-zinc-500">
            Sharing · Templates · Versioning · Automation · Integrity · Notifications
          </p>
          <span className="mt-4 text-sm font-semibold text-violet-650 dark:text-violet-400">Features</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            Beautiful capabilities to collect smarter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to create, schedule, version, and route form data smoothly with zero servers or extra configuration overhead.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-16 px-6 sm:gap-20 md:gap-24 md:px-12 lg:gap-28">
        {FEATURES.map((feat, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24 items-center"
            >
              <div className={cx("max-w-xl flex-1 self-center", !isEven && "lg:order-last")}>
                <FeaturedIcon icon={feat.icon} color={feat.color} />
                <div className={cx("text-[11px] font-bold tracking-widest uppercase mb-2.5", iconColors[feat.color])}>
                  {feat.label}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-zinc-50 tracking-tight leading-tight">
                  {feat.titlePart1}
                  <span className={cx("bg-clip-text text-transparent bg-gradient-to-r", feat.gradientClass)}>
                    {feat.titleHighlight}
                  </span>
                  {feat.titlePart2}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
                <ul className="mt-8 flex flex-col gap-4 pl-2 md:gap-5 md:pl-4">
                  {feat.bullets.map((bullet, bIdx) => (
                    <CheckItemText key={bIdx} boldText={bullet.bold} text={bullet.text} color={feat.color} />
                  ))}
                </ul>
              </div>

              <div className="relative w-full flex-1 lg:h-128 flex justify-center items-center">
                <AlternateImageMockup className={cx(isEven ? "lg:left-0" : "lg:right-0")}>
                  <img
                    alt="Dashboard mockup showing application interface"
                    src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                    className="size-full object-contain lg:w-auto lg:max-w-none dark:hidden"
                  />
                  <img
                    alt="Dashboard mockup showing application interface"
                    src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                    className="size-full object-contain not-dark:hidden lg:w-auto lg:max-w-none"
                  />
                </AlternateImageMockup>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
