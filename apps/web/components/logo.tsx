"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import fireAnimation from "../public/Fire.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function Logo({ isLanding = false, href = "/dashboard" }: { isLanding?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 select-none">
      <div className={`flex-shrink-0 flex items-center justify-center pb-2 ${isLanding ? 'w-10 h-10' : 'w-8 h-8'}`}>
        <Lottie animationData={fireAnimation} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
      </div>
      <span className="text-2xl font-sans font-semibold tracking-med text-black dark:text-white">
        FormForge
      </span>
    </Link>
  );
}
