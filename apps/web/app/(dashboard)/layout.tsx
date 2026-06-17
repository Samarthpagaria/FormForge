"use client";

import React from "react";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { FloatingActions } from "@/components/dashboard/floating-actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-[#1a1a1a] dark:text-zinc-50">
      <DashboardNavbar />
      {/* max-w-screen-2xl keeps a sane max-width at large monitors */}
      <main className="flex-1 w-full px-6 pt-20">
        {children}
      </main>
      <FloatingActions />
    </div>
  );
}
