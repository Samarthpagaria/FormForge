"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Globe, AlertCircle } from "lucide-react";
import { trpc } from "@/src/trpc/client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function Panel({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function MapRow() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { data: mapRaw, isLoading: mapLoading, isError: mapError, refetch: mapRefetch } = trpc.analytics.getGlobalMapData.useQuery();

  if (!mounted) {
    return (
      <div className="h-[320px] rounded-2xl border border-neutral-200/80 dark:border-zinc-800/80 bg-neutral-50/50 dark:bg-zinc-900/40 animate-pulse mt-4" />
    );
  }

  return (
    <Panel delay={0.2} className="mt-4 flex flex-col w-full overflow-hidden">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-zinc-500 mb-6 flex items-center gap-2">
        <Globe size={14} /> Global Responses
      </p>

      {mapLoading ? (
        <div className="animate-pulse bg-neutral-100/50 dark:bg-zinc-800/30 rounded-xl h-[300px] w-full" />
      ) : mapError ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-red-500">Failed to load map data</p>
          <button onClick={() => mapRefetch()} className="text-xs text-violet-600 mt-2 underline">Retry</button>
        </div>
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center">
          <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                const regions = mapRaw?.regions || [];
                const maxValue = Math.max(...regions.map(d => Number(d.value)), 1);
                const colorScale = scaleLinear<string>().domain([0, maxValue]).range(["#ede9fe", "#8b5cf6"]);
                
                return geographies.map((geo) => {
                  const d = regions.find((s) => s.id === geo.id || s.id === geo.properties?.ISO_A2 || s.id === geo.properties?.ISO_A3);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={d ? colorScale(Number(d.value)) : "#f5f5f5"}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
                        hover: { fill: "#7c3aed", outline: "none", transition: "all 250ms" },
                        pressed: { fill: "#6d28d9", outline: "none" },
                      }}
                    />
                  );
                });
              }}
            </Geographies>
            {mapRaw?.points?.map((pt, i) => (
              <Marker key={i} coordinates={[pt.lng, pt.lat]}>
                <circle r={Math.min(Math.max(pt.value * 2, 4), 12)} fill="#ef4444" fillOpacity={0.7} stroke="#ffffff" strokeWidth={1.5} />
              </Marker>
            ))}
          </ComposableMap>
        </div>
      )}
    </Panel>
  );
}
