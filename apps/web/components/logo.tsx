"use client";

import React from "react";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 select-none">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center pb-2">
        <DotLottieReact src="/Fire.json" loop autoplay />
      </div>
      <span className="text-2xl font-sans font-semibold tracking-med text-black dark:text-white">
        FormForge
      </span>
    </Link>
  );
}
