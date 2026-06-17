"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-white/70 dark:bg-zinc-900/70 border-neutral-200/80 dark:border-zinc-800/80 px-4 py-3 transition-all duration-700 hover:border-violet-500/50 hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-md overflow-hidden",
        className
      )}
      style={{
        maskImage: "linear-gradient(to right, #000 80%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, #000 80%, transparent 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 p-1.5 text-blue-600 dark:text-blue-400">
          {icon}
        </span>
        <p className={cn("text-sm font-semibold text-neutral-700 dark:text-neutral-300", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-base font-bold text-neutral-900 dark:text-white">{description}</p>
      <p className="text-neutral-400 dark:text-neutral-500 text-xs">{date}</p>

      {/* Blur fade effect in the right 20% */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent to-transparent backdrop-blur-[1.5px] pointer-events-none rounded-r-xl"
      />
    </div>
  );
}

export interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-start opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
