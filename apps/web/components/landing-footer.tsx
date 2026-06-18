"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconBrandGithub, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { Logo } from "@/components/logo";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/Samarthpagaria/FormForge",
    label: "GitHub",
    icon: IconBrandGithub,
  },
  {
    href: "https://x.com/SamarthPagaria",
    label: "X",
    icon: IconBrandX,
  },
  {
    href: "https://www.linkedin.com/in/samarth-pagaria-81a93b281/",
    label: "LinkedIn",
    icon: IconBrandLinkedin,
  },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-dashed border-neutral-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-5 px-6 py-8 sm:flex-row md:px-12"
      >
        <Logo isLanding href="/" />

        <div className="flex items-center gap-1">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Icon size={18} stroke={1.75} />
            </Link>
          ))}
        </div>

        <p className="text-xs text-neutral-400 dark:text-zinc-600">
          © {year} FormForge · Samarth Pagaria
        </p>
      </motion.div>
    </footer>
  );
}
