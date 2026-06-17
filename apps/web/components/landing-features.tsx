"use client";

import React from "react";
import type { FC, HTMLAttributes } from "react";
import { 
  Link01, 
  File02, 
  ClockRefresh, 
  Calendar, 
  Shield01, 
  Mail01
} from "@untitledui/icons";
import { cx } from "@/lib/utils/cx";

// Custom inline FeaturedIcon component supporting color-themed states
interface FeaturedIconProps {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const FeaturedIcon: FC<FeaturedIconProps> = ({ icon: Icon, color }) => {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20",
    violet: "bg-violet-100 text-violet-650 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/20",
    blue: "bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/20",
    amber: "bg-amber-50 text-amber-650 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/20",
    rose: "bg-rose-50 text-rose-650 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/20",
    indigo: "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20"
  };

  return (
    <div className={cx("flex items-center justify-center size-12 rounded-xl border mb-5 shadow-xs", colorClasses[color] || colorClasses.violet)}>
      <Icon className="size-6" />
    </div>
  );
};

// Custom CheckItemText component supporting color-themed checkmarks
interface CheckItemTextProps {
  boldText: string;
  text: string;
  color: string;
}

const CheckItemText: FC<CheckItemTextProps> = ({ boldText, text, color }) => {
  const dotClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/20",
    violet: "bg-violet-100 text-violet-650 dark:bg-violet-950/50 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/20",
    blue: "bg-blue-100 text-blue-650 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/20",
    amber: "bg-amber-100 text-amber-650 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/20",
    rose: "bg-rose-100 text-rose-650 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/20",
    indigo: "bg-indigo-100 text-indigo-650 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/20"
  };

  return (
    <li className="flex items-start gap-3 text-neutral-600 dark:text-zinc-450 text-sm leading-relaxed">
      <div className={cx("flex-shrink-0 flex items-center justify-center size-5 rounded-full mt-0.5 border", dotClasses[color] || dotClasses.violet)}>
        <svg className="size-2.5 stroke-[4.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <strong className="font-semibold text-neutral-800 dark:text-zinc-200">{boldText}</strong>
        <span className="mx-1.5 opacity-40">•</span>
        <span>{text}</span>
      </div>
    </li>
  );
};

// AlternateImageMockup component exactly matching requested specs
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

// Structured features configuration
interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
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
    icon: Link01,
    label: "SHARING",
    color: "emerald",
    titlePart1: "Share anywhere, ",
    titleHighlight: "instantly",
    titlePart2: ".",
    gradientClass: "from-emerald-500 to-teal-500 dark:from-emerald-450 dark:to-teal-450",
    description: "Every form gets a clean public URL and an auto-generated QR code. Print it, embed it, or drop it in a link — no extra setup required.",
    bullets: [
      { bold: "Print-ready", text: "Generate high-resolution printable QR codes instantly." },
      { bold: "Short links", text: "Share clean, branded URLs with custom slugs." },
      { bold: "Embeddable", text: "Drop responsive forms on any website in seconds." }
    ]
  },
  {
    icon: File02,
    label: "TEMPLATES",
    color: "violet",
    titlePart1: "Skip the ",
    titleHighlight: "blank page",
    titlePart2: ".",
    gradientClass: "from-violet-500 to-fuchsia-500 dark:from-violet-450 dark:to-fuchsia-450",
    description: "Start from a library of ready-made templates across feedback, events, education, and more — or save your own as a custom template for next time.",
    bullets: [
      { bold: "100+ layouts", text: "Access templates for surveys, registration, and leads." },
      { bold: "Team sharing", text: "Save any form draft as a reusable library item." },
      { bold: "One-click build", text: "Launch themes, colors, and field layouts in a tap." }
    ]
  },
  {
    icon: ClockRefresh,
    label: "VERSION CONTROL",
    color: "blue",
    titlePart1: "Every edit, ",
    titleHighlight: "remembered",
    titlePart2: ".",
    gradientClass: "from-blue-500 to-sky-550 dark:from-blue-450 dark:to-sky-450",
    description: "FormForge saves a new version automatically as you build. Preview any past version and roll back instantly — nothing is ever truly lost.",
    bullets: [
      { bold: "Autosave drafts", text: "Secure, incremental history snapshots of your schemas." },
      { bold: "Live previews", text: "Compare diffs side-by-side between past versions." },
      { bold: "Safe rollback", text: "Roll back instantly with database schema protection." }
    ]
  },
  {
    icon: Calendar,
    label: "AUTOMATION",
    color: "amber",
    titlePart1: "Forms that ",
    titleHighlight: "open and close",
    titlePart2: " themselves.",
    gradientClass: "from-amber-500 to-orange-500 dark:from-amber-450 dark:to-orange-450",
    description: "Schedule exactly when a form goes live and when it shuts down. Set it once, and let FormForge handle the rest — no manual toggling.",
    bullets: [
      { bold: "Timer locks", text: "Configure precise publishing and closing schedules." },
      { bold: "Custom notices", text: "Customize messages for visitors who arrive late." },
      { bold: "Timezone sync", text: "Run automated schedules relative to target regions." }
    ]
  },
  {
    icon: Shield01,
    label: "INTEGRITY",
    color: "rose",
    titlePart1: "You decide who responds, and ",
    titleHighlight: "how often",
    titlePart2: ".",
    gradientClass: "from-rose-500 to-pink-500 dark:from-rose-450 dark:to-pink-450",
    description: "Restrict forms to one response per person using IP detection, or open them up for unlimited submissions — the choice is yours, per form.",
    bullets: [
      { bold: "Spam block", text: "Prevent duplication using IP and cookie tracking." },
      { bold: "White-listing", text: "Confine response access to specific emails or domains." },
      { bold: "Flexible limits", text: "Toggle response frequency rules per form configuration." }
    ]
  },
  {
    icon: Mail01,
    label: "NOTIFICATIONS",
    color: "indigo",
    titlePart1: "Know the ",
    titleHighlight: "exact moment",
    titlePart2: " someone responds.",
    gradientClass: "from-indigo-500 to-purple-550 dark:from-indigo-450 dark:to-purple-450",
    description: "Get a clean, branded email the instant a new submission comes in — complete with every answer, ready to read without logging in.",
    bullets: [
      { bold: "Instant alerts", text: "Real-time notifications sent directly to your inbox." },
      { bold: "Mobile layouts", text: "Perfect email formats readable on any device screen." },
      { bold: "Data attached", text: "Review responses and file upload attachments inline." }
    ]
  }
];

export const FeaturesAlternatingLayout01 = () => {
  return (
    <section className="flex flex-col gap-12 overflow-hidden bg-[#f5f5f3] dark:bg-[#09090b] py-16 sm:gap-16 md:gap-20 md:py-24 lg:gap-24">
      
      {/* Top Header Section */}
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="text-sm font-semibold text-violet-650 dark:text-violet-400">Features</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            Beautiful capabilities to collect smarter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to create, schedule, version, and route form data smoothly with zero servers or extra configuration overhead.
          </p>
        </div>
      </div>

      {/* Feature Blocks Container (Alternating layout, image orders swap on lg screens) */}
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-16 px-6 sm:gap-20 md:gap-24 md:px-12 lg:gap-28">
        {FEATURES.map((feat, idx) => {
          const isEven = idx % 2 === 0;
          const labelColors: Record<string, string> = {
            emerald: "text-emerald-600 dark:text-emerald-400",
            violet: "text-violet-600 dark:text-violet-400",
            blue: "text-blue-600 dark:text-blue-400",
            amber: "text-amber-600 dark:text-amber-400",
            rose: "text-rose-600 dark:text-rose-400",
            indigo: "text-indigo-600 dark:text-indigo-400"
          };

          return (
            <div key={idx} className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24 items-center">
              
              {/* TEXT COLUMN */}
              <div className={cx(
                "max-w-xl flex-1 self-center",
                !isEven && "lg:order-last"
              )}>
                <FeaturedIcon icon={feat.icon} color={feat.color} />
                
                {/* Colored Category Tag */}
                <div className={cx("text-[11px] font-bold tracking-widest uppercase mb-2.5", labelColors[feat.color] || labelColors.violet)}>
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
                    <CheckItemText 
                      key={bIdx} 
                      boldText={bullet.bold}
                      text={bullet.text} 
                      color={feat.color}
                    />
                  ))}
                </ul>
              </div>

              {/* IMAGE/MOCKUP COLUMN (Image div code kept exactly as is, no changes to this block) */}
              <div className="relative w-full flex-1 lg:h-128 flex justify-center items-center">
                <AlternateImageMockup className={cx(isEven ? "lg:left-0" : "lg:right-0")}>
                  {/* Light mode image */}
                  <img
                    alt="Dashboard mockup showing application interface"
                    src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                    className="size-full object-contain lg:w-auto lg:max-w-none dark:hidden"
                  />
                  {/* Dark mode image */}
                  <img
                    alt="Dashboard mockup showing application interface"
                    src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                    className="size-full object-contain not-dark:hidden lg:w-auto lg:max-w-none"
                  />
                </AlternateImageMockup>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
