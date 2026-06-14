"use client";

import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ShinyButton } from "@/components/ui/shiny-button";
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

export function DashboardNavbar() {
  const tabs: TabItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Forms", href: "/forms", icon: FileText },
    { title: "Templates", href: "/templates", icon: Layout },
    { title: "Analytics", href: "/analytics", icon: LineChart },
    { title: "Responses", href: "/responses", icon: Inbox },
    { title: "Docs", href: "/docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-neutral-200 dark:border-zinc-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 select-none group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-zinc-100 dark:to-zinc-300 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <span className="text-lg font-bold text-white dark:text-black">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:from-zinc-50 dark:to-zinc-300 tracking-tight">
              FormForge
            </span>
          </Link>
        </div>

        {/* Middle: Expandable Navigation Tabs */}
        <nav className="hidden md:flex items-center justify-center">
          <ExpandableTabs tabs={tabs} />
        </nav>

        {/* Right: Actions (New Form, Profile) */}
        <div className="flex items-center gap-4">
          <Link href="/forms/new">
            <ShinyButton className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-300">
              <span className="flex items-center gap-1.5">
                <Plus size={16} className="stroke-[2.5]" />
                New Form
              </span>
            </ShinyButton>
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-zinc-850 p-[2px]">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-full",
                },
              }}
            />
          </div>
        </div>

      </div>
    </header>
  );
}
