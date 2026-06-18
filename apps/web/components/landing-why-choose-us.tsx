"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  BookOpen,
  Map,
  Webhook,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { cx } from "@/lib/utils/cx";

type AccentColor = "cyan" | "emerald" | "amber" | "blue" | "rose" | "teal";

interface BentoCard {
  tag: string;
  headline: string;
  content: React.ReactNode;
  icon: LucideIcon;
  color: AccentColor;
  badge?: string;
  href?: string;
}

const labelColors: Record<AccentColor, string> = {
  cyan: "text-cyan-600 dark:text-cyan-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  blue: "text-blue-600 dark:text-blue-400",
  rose: "text-rose-600 dark:text-rose-400",
  teal: "text-teal-600 dark:text-teal-400",
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
    icon: Webhook,
    color: "cyan",
  },
  {
    tag: "Form Layout Previewer",
    headline: "Zero-Friction Sandbox Testing",
    badge: "7 display modes",
    content:
      "Instantly toggle out of edit mode and into a functional, sandboxed testing environment. Validate conditional fields, grid responsiveness, and required inputs before pushing to production.",
    icon: LayoutGrid,
    color: "teal",
  },
  {
    tag: "Clerk Authentication",
    headline: "Enterprise-Grade Security",
    content:
      "Protect your forms with world-class authentication. Enjoy seamless social logins, multi-factor authentication, and bulletproof session management right out of the box.",
    icon: ShieldCheck,
    color: "emerald",
  },
  {
    tag: "Advanced Submission Handling",
    headline: "Rich Respondent Insights",
    content:
      "Go beyond basic text answers. Every submission captures IP detection, regional routing data, and country localization to help you spot trends instantly.",
    icon: Globe2,
    color: "amber",
  },
  {
    tag: "Scalar API Docs",
    headline: "Interactive API Reference",
    content:
      "Built for developers. Browse the FormForge REST API with Scalar — test endpoints, review schemas, and explore how to manage forms and submissions programmatically.",
    icon: BookOpen,
    color: "blue",
    href: "/docs",
  },
  {
    tag: "Global Heatmaps",
    headline: "Geographical Engagement Heatmaps",
    content:
      "Visualize your reach globally. Watch submission hotspots light up a real-time map and see where your forms convert highest across countries and time zones.",
    icon: Map,
    color: "rose",
  },
];

function BentoCardItem({ card }: { card: BentoCard }) {
  const Icon = card.icon;

  const inner = (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group h-full rounded-2xl border border-dashed border-neutral-200/90 bg-white p-[3px] shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 hover:border-neutral-300 hover:shadow-md dark:hover:border-zinc-700"
    >
      <div className="h-full rounded-[13px] border border-dashed border-neutral-100 bg-transparent p-[3px] dark:border-zinc-800/80">
        <div className="flex h-full flex-col rounded-[10px] border border-dashed border-neutral-200/70 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Icon className={cx("size-6 shrink-0 stroke-[1.75]", labelColors[card.color])} />
            {card.badge && (
              <span className="rounded-full border border-dashed border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                {card.badge}
              </span>
            )}
          </div>

          <span className={cx("mb-2 text-[11px] font-bold uppercase tracking-widest", labelColors[card.color])}>
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
              Open docs →
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="block h-full">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        >
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Why Choose Us?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50 leading-tight">
            Built different, on purpose
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Real infrastructure behind every form: auth, sync, analytics, and developer tools that actually ship.
          </p>
        </motion.div>
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
