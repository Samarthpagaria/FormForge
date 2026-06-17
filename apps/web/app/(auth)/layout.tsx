"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getRandomAuthImage } from "../../src/utils/auth-images";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setImageUrl(getRandomAuthImage(pathname || ""));
  }, [pathname]);

  return (
    <AuroraBackground className="w-screen p-4 md:p-8 overflow-hidden select-none bg-[#FDFCF8] dark:bg-zinc-950 text-slate-950">
      <div suppressHydrationWarning className="flex w-full max-w-5xl h-[650px] items-center justify-center gap-12 md:gap-16 z-10 relative">
        
        {/* Left Component: Curved vertical rectangular image container */}
        <div className="relative hidden md:block w-[400px] h-[600px] rounded-3xl overflow-hidden bg-[#F5F4EC] dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shrink-0">
          {/* Background grid pattern placeholder */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
          
          {/* The Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="FormForge Authentication"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          )}
          
          {/* Decorative Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Bottom text overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-[#FDFCF8] dark:from-zinc-950 via-[#FDFCF8]/10 dark:via-zinc-950/10 to-transparent z-10">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-2">FormForge</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Create and manage highly dynamic forms with premium user experience.
            </p>
          </div>
        </div>

        {/* Right Component: Clerk form container */}
        <div className="flex h-[600px] items-center justify-center shrink-0 relative z-10">
          {children}
        </div>

      </div>
    </AuroraBackground>
  );
}