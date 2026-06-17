"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import fireAnimation from "../public/Fire.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function Logo({ isLanding = false, href = "/dashboard" }: { isLanding?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 select-none">
      {isLanding ? (
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center pb-2">
          <Lottie animationData={fireAnimation} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
          <FileText size={18} className="stroke-[2.5]" />
        </div>
      )}
      <span className="text-2xl font-sans font-semibold tracking-med text-black dark:text-white">
        FormForge
      </span>
    </Link>
  );
}
