"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ExpandableTabs, TabItem } from "@/components/ui/expandable-tabs";
import {
  LayoutDashboard,
  FileText,
  Layout,
  LineChart,
  Inbox,
  BookOpen,
  Plus,
} from "lucide-react";

function GradientNewFormButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/create-form")}
      className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer group"
      style={{
        background: "linear-gradient(120deg, #18181b, #52525b, #a1a1aa, #52525b, #18181b)",
        backgroundSize: "300% 300%",
        animation: "gradientShift 4s ease infinite",
      }}
    >
      {/* Shiny sweep */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <span className="relative flex items-center gap-1.5">
        <Plus size={14} className="stroke-[2.5]" />
        New Form
      </span>
      <style jsx>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </button>
  );
}

export function DashboardNavbar() {
  const tabs: TabItem[] = [
    { title: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
    { title: "Forms",     href: "/forms",      icon: FileText },
    { title: "Templates", href: "/templates",  icon: Layout },
    { title: "Analytics", href: "/analytics",  icon: LineChart },
    { title: "Responses", href: "/responses",  icon: Inbox },
    { title: "Docs",      href: "/docs",       icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/dashboard" className="select-none shrink-0">
          <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-zinc-50">
            FormForge
          </span>
        </Link>

        {/* Compact pill navigation */}
        <nav className="hidden md:flex items-center justify-center">
          <ExpandableTabs
            tabs={tabs}
            className="rounded-full py-1 px-1 gap-0.5 h-9"
          />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 shrink-0">
          <GradientNewFormButton />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-zinc-800 p-[2px]">
            <UserButton appearance={{ elements: { avatarBox: "h-7 w-7 rounded-full" } }} />
          </div>
        </div>

      </div>
    </header>
  );
}
