"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";
import { cx } from "@/lib/utils/cx";

const iconCache = new Map<string, object>();

interface LordiconIconProps {
  src: string;
  size?: number;
  className?: string;
  trigger?: "hover" | "loop" | "none";
}

export function LordiconIcon({
  src,
  size = 24,
  className,
  trigger = "hover",
}: LordiconIconProps) {
  const playerRef = useRef<Player>(null);
  const [icon, setIcon] = useState<object | null>(() => iconCache.get(src) ?? null);

  useEffect(() => {
    if (iconCache.has(src)) {
      setIcon(iconCache.get(src)!);
      return;
    }

    let cancelled = false;
    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          iconCache.set(src, data);
          setIcon(data);
        }
      })
      .catch((err) => console.error("[LordiconIcon] Failed to load icon:", src, err));

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (icon && trigger === "loop") {
      playerRef.current?.playFromBeginning();
    }
  }, [icon, trigger]);

  const play = () => playerRef.current?.playFromBeginning();

  if (!icon) {
    return (
      <div
        className={cx("animate-pulse rounded-md bg-neutral-200/40 dark:bg-zinc-700/40", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cx("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      onMouseEnter={trigger === "hover" ? play : undefined}
    >
      <Player ref={playerRef} icon={icon} size={size} />
    </div>
  );
}
