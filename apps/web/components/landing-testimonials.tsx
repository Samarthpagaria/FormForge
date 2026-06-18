"use client";

import React from "react";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Alex Rivera",
    role: "Full-Stack Developer",
    quote:
      "As a developer, I hate building custom form logic over and over. This tool gives me the perfect middle ground: a clean canvas for my clients to edit fields, and a typed tRPC backend for me to query submissions instantly. The Scalar API reference at /api/docs is an absolute lifesaver.",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Sarah Chen",
    role: "Lead PM at Optima Growth",
    quote:
      "The hybrid version control changed how our marketing team works. They can tweak questions or reorder layout fields in draft mode without breaking active data collection. We only hit publish when the copy is perfect, meaning zero downtime for our live product sign-ups.",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Marcus Vance",
    role: "Growth Director",
    quote:
      "The submission enrichment is top-tier. Seeing live conversions light up our global heatmap alongside absolute IP localization and country mapping lets us spot exactly where our campaigns are hitting hardest in real-time. We dropped our external analytics subscription within a week.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Liam Kincaid",
    role: "CTO at CorePulse",
    quote:
      "We needed a form solution that wouldn't lock us into a proprietary ecosystem. Having our user authentication tie flawlessly into our local PostgreSQL database via Clerk webhooks and Drizzle saved us months of engineering time. It's an absolute masterclass in developer-first architecture.",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Elena Rostova",
    role: "Senior Product Designer",
    quote:
      "The sandbox previewer is incredibly accurate. What you configure on the canvas is exactly what the user experiences, down to the pixel responsiveness and validation states. Being able to test complex layouts instantly without affecting production data collection is brilliant.",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "Devansh Mehta",
    role: "SecOps Lead",
    quote:
      "Most low-code form builders are a security black box. This platform gives us complete control. Knowing every submission captures raw IP verification and regional routing parameters natively at the backend layer allows us to filter out malicious spam threats effortlessly.",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="flex w-[340px] shrink-0 flex-col rounded-2xl border border-dashed border-neutral-200/90 bg-white p-[3px] shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:w-[380px]">
      <div className="h-full rounded-[13px] border border-dashed border-neutral-100 bg-transparent p-[3px] dark:border-zinc-800/80">
        <div className="flex h-full flex-col rounded-[10px] border border-dashed border-neutral-200/70 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-900">
          <Quote className="mb-3 size-4 text-neutral-300 dark:text-zinc-600" />
          <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-zinc-400">
            &ldquo;{item.quote}&rdquo;
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-dashed border-neutral-100 pt-4 dark:border-zinc-800">
            <img
              src={item.avatar}
              alt={item.name}
              width={40}
              height={40}
              className="size-10 rounded-full border border-dashed border-neutral-200 object-cover dark:border-zinc-700"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-zinc-100">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-zinc-500">{item.role}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className={`flex gap-4 py-1 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function LandingTestimonials() {
  const row1 = TESTIMONIALS.slice(0, 3);
  const row2 = TESTIMONIALS.slice(3);

  return (
    <section
      id="testimonials"
      className="overflow-hidden bg-[#f5f5f3] dark:bg-[#09090b] py-16 md:py-20"
    >
      <div className="mx-auto mb-10 w-full max-w-7xl px-6 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-zinc-50">
            Loved by builders worldwide
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-zinc-400 max-w-2xl">
            From indie developers to growth teams, FormForge ships the workflow they actually want.
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 50s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
