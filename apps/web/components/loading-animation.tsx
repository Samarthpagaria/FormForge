"use client";

import React from "react";
import dynamic from "next/dynamic";
import loadingAnimation from "../public/loading.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-4">
      {/* 1920x1080 animation, so we use an aspect-video container for proper scaling */}
      <div className="w-64 sm:w-80 aspect-video flex items-center justify-center">
        <Lottie animationData={loadingAnimation} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
      </div>
      <p className="text-sm font-medium text-neutral-500 dark:text-zinc-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
