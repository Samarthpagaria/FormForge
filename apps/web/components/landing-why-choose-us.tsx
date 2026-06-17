"use client";

import React from "react";
import Link from "next/link";
import { LordiconIcon } from "@/components/ui/lordicon-icon";
import { LORDICONS } from "@/lib/lordicons";
import { cx } from "@/lib/utils/cx";

type AccentColor = "cyan" | "emerald" | "amber" | "blue" | "rose" | "teal";

interface BentoCard {
  tag: string;
  headline: string;
  content: React.ReactNode;
  iconSrc: string;
  color: AccentColor;
  badge?: string;
  href?: string;
}

const accentStyles: Record<AccentColor, { label: string; icon: string }> = {
  cyan: {
    label: "text-cyan-600 dark:text-cyan-400",
    icon: "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/30",
  },
  emerald: {
    label: "text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
  },
  amber: {
    label: "text-amber-600 dark:text-amber-400",
    icon: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
  },
  blue: {
    label: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
  },
  rose: {
    label: "text-rose-600 dark:text-rose-400",
    icon: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30",
  },
  teal: {
    label: "text-teal-600 dark:text-teal-400",
    icon: "bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900/30",
  },
};

const BENTO_CARDS: BentoCard[] = [
  {
    tag: "Clerk + Drizzle Sync",
    headline: "Instant Sync Engine",
    content: (
      <>
        Sign up via Clerk and automated{" "}
        <span className="font-semibold text-cyan-700 dark:text-cyan-300 decoration-cyan-400/50 underline decoration-dashed underline-offset-2">
          webhooks
        </span>{" "}
        map profiles into our Drizzle PostgreSQL database. Zero lag, zero manual setup.
      </>
    ),
    iconSrc: LORDICONS.webhook,
    color: "cyan",
  },
  {
    tag: "Form Layout Previewer",
    headline: "Zero-Friction Sandbox Testing",
    badge: "7 display modes",
    content:
      "Instantly toggle out of edit mode and into a functional, sandboxed testing environment. Validate conditional fields, grid responsiveness, and required inputs before pushing to production.",
    iconSrc: LORDICONS.grid,
    color: "teal",
  },
  {
    tag: "Clerk Authentication",
    headline: "Enterprise-Grade Security",
    content:
      "Protect your forms with world-class authentication. Enjoy seamless social logins, multi-factor authentication, and bulletproof session management right out of the box.",
    iconSrc: LORDICONS.shield,
    color: "emerald",
  },
  {
    tag: "Advanced Submission Handling",
    headline: "Rich Respondent Insights",
    content:
      "Go beyond basic text answers. Every submission captures IP detection, regional routing data, and country localization to help you spot trends instantly.",
    iconSrc: LORDICONS.globe,
    color: "amber",
  },
  {
    tag: "Scalar API Docs",
    headline: "Interactive API Reference",
    content:
      "Built for developers. Browse the FormForge REST API with Scalar — test endpoints, review schemas, and explore how to manage forms and submissions programmatically.",
    iconSrc: LORDICONS.apiDocs,
    color: "blue",
    href: "/api/docs",
  },
  {
    tag: "Global Heatmaps",
    headline: "Geographical Engagement Heatmaps",
    content:
      "Visualize your reach globally. Watch submission hotspots light up a real-time map and see where your forms convert highest across countries and time zones.",
    iconSrc: LORDICONS.map,
    color: "rose",
  },
];

function BentoCardItem({ card }: { card: BentoCard }) {
  const styles = accentStyles[card.color];

  const inner = (
    <article className="group h-full rounded-2xl border border-dashed border-neutral-200/90 bg-white p-[3px] shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 hover:border-neutral-300 hover:shadow-md dark:hover:border-zinc-700">
      <div className="h-full rounded-[13px] border border-dashed border-neutral-100 bg-transparent p-[3px] dark:border-zinc-800/80">
        <div className="flex h-full flex-col rounded-[10px] border border-dashed border-neutral-200/70 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div
              className={cx(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-xs",
                styles.icon,
              )}
            >
              <LordiconIcon src={card.iconSrc} size={24} trigger="loop" />
            </div>
            {card.badge && (
              <span className="rounded-full border border-dashed border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                {card.badge}
              </span>
            )}
          </div>

          <span
            className={cx(
              "mb-2 text-[11px] font-bold uppercase tracking-widest",
              styles.label,
            )}
          >
            {card.tag}
          </span>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            {card.headline}
          </h3>

          <p className="mt-2.5 text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed">
            {card.content}
          </p>

          {card.href && (
            <span className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
              Open API docs →
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (card.href) {
    return (
      <Link href={card.href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function LandingWhyChooseUs() {
  return (
    <section id="why-choose-us" className="flex flex-col gap-12 overflow-hidden bg-[#f5f5f3] dark:bg-[#09090b] py-16 sm:gap-16 md:gap-20 md:py-24 lg:gap-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Why Choose Us?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            Built different, on purpose
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Real infrastructure behind every form: auth, sync, analytics, and developer tools that actually ship.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[88rem] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {BENTO_CARDS.map((card) => (
            <BentoCardItem key={card.headline} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
