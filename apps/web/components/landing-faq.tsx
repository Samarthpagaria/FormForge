"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils/cx";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: "How does the draft vs. live versioning engine work?",
    answer: (
      <>
        Every edit you make on the workspace canvas automatically autosaves to your isolated draft profile, ensuring you never lose your progress. Your live respondents will continue to see your previous version without interruption until you explicitly click{" "}
        <strong className="font-semibold text-neutral-800 dark:text-zinc-200">&quot;Publish Version&quot;</strong>
        , which updates the live endpoint seamlessly.
      </>
    ),
  },
  {
    question: "What kind of data is captured with each form submission?",
    answer:
      "Beyond basic input fields, our backend handles advanced metadata enrichment. Every payload safely logs precise backend validation stats, country localization code, and secure IP verification to give you a clean, data-rich overview of your respondents.",
  },
  {
    question: "Is user data synchronized automatically with our database?",
    answer:
      "Yes. Through our automated Clerk authentication webhooks, user lifecycle actions are immediately synced down to our central Drizzle-powered PostgreSQL database. The moment a user signs up or modifies their profile, your database matches that state instantly.",
  },
  {
    question: "Can I integrate these forms directly into an external application?",
    answer:
      "Yes. FormForge exposes a REST API documented with Scalar at /api/docs. You can review endpoints, test payloads, and manage forms and submissions programmatically from any external codebase.",
  },
  {
    question: "How do the Scalar API docs benefit my team?",
    answer:
      "The interactive Scalar reference covers FormForge's REST endpoints — forms, submissions, analytics, and more. Developers can explore request/response schemas and try calls directly in the browser without digging through source code.",
  },
  {
    question: "Can I see exactly where my form responses are coming from globally?",
    answer:
      "Yes. Our built-in global heatmap uses secure, backend-level IP localization to map incoming submission traffic onto an interactive geographical layout. You can visually track engagement spikes across specific countries and continents to optimize your marketing distribution channels.",
  },
  {
    question: "What happens to my data if a user deletes their profile via Clerk?",
    answer:
      "Our system handles user lifecycles symmetrically. Through secure automated webhooks, when a user updates or removes their profile through Clerk, a background trigger instantly syncs that exact state down to your Drizzle-managed PostgreSQL database, maintaining clean, compliant, and up-to-date user records automatically.",
  },
  {
    question: "Is there a limit to how many versions a single form can have?",
    answer: (
      <>
        There are no arbitrary limits. Your form history utilizes an immutable{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300">
          form_versions
        </code>{" "}
        snapshot table. You can modify your draft canvas as much as you like, and every single time you explicitly hit &quot;Publish,&quot; a clean, incremented production version is safely preserved forever.
      </>
    ),
  },
];

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200/90 bg-white p-[3px] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="rounded-[13px] border border-dashed border-neutral-100 bg-transparent p-[3px] dark:border-zinc-800/80">
        <div className="overflow-hidden rounded-[10px] border border-dashed border-neutral-200/70 bg-white dark:border-zinc-800/60 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50/80 dark:hover:bg-zinc-800/30"
          >
            <span className="text-sm font-semibold text-neutral-900 dark:text-zinc-100 leading-snug">
              {item.question}
            </span>
            <ChevronDown
              className={cx(
                "size-4 shrink-0 text-neutral-400 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>
          <div
            className={cx(
              "grid transition-all duration-200 ease-in-out",
              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#f5f5f3] dark:bg-[#09090b] py-16 md:py-20">
      <div className="mx-auto w-full max-w-3xl px-6 md:px-12">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50">
            Questions, answered
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-zinc-400">
            Everything you need to know before shipping your first form.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
