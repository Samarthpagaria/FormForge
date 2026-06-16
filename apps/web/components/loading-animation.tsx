"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-4">
      {/* 1920x1080 animation, so we use an aspect-video container for proper scaling */}
      <div className="w-64 sm:w-80 aspect-video flex items-center justify-center">
        <DotLottieReact src="/loading.json" loop autoplay />
      </div>
      <p className="text-sm font-medium text-neutral-500 dark:text-zinc-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
