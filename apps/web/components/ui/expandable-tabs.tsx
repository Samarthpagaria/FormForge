"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const MotionLink = motion.create(Link);

export interface TabItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isExpanded: boolean) => ({
    gap: isExpanded ? ".5rem" : 0,
    paddingLeft: isExpanded ? "1rem" : ".5rem",
    paddingRight: isExpanded ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-neutral-900 dark:text-white",
}: ExpandableTabsProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-full border bg-background/80 backdrop-blur-md p-1 shadow-sm border-neutral-200 dark:border-zinc-800",
        className
      )}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        const isHovered = hoveredIndex === index;
        const isExpanded = isActive || isHovered;

        return (
          <MotionLink
            key={tab.title}
            href={tab.href}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isExpanded}
            transition={transition}
            className={cn(
              "relative flex items-center h-9 rounded-full px-3 text-sm font-medium transition-colors duration-300 cursor-pointer select-none",
              isActive
                ? cn("bg-neutral-100 dark:bg-zinc-850", activeColor)
                : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100/60 dark:hover:bg-zinc-800/40 hover:text-neutral-900 dark:hover:text-zinc-200"
            )}
          >
            <Icon size={18} className="shrink-0" />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </MotionLink>
        );
      })}
    </div>
  );
}
