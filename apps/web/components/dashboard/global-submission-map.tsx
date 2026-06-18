"use client";

import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

/** Natural Earth GeoJSON — includes ISO_A2 on each country for heatmap matching */
export const GEO_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

export interface MapRegion {
  id?: string;
  iso2?: string;
  value: number;
}

export interface MapPoint {
  lat: number;
  lng: number;
  value: number;
}

export interface MapPin {
  lat: number;
  lng: number;
}

interface GlobalSubmissionMapProps {
  regions?: MapRegion[];
  points?: MapPoint[];
  pins?: MapPin[];
  height?: number;
  heatFrom?: string;
  heatTo?: string;
}

function findRegion(
  geo: { id: string; properties?: Record<string, unknown> },
  regions: MapRegion[],
) {
  const iso =
    (geo.properties?.ISO_A2 as string | undefined) ??
    (geo.properties?.iso_a2 as string | undefined);
  const geoId = String(geo.id);

  return regions.find(
    (r) =>
      (r.iso2 && iso && r.iso2.toUpperCase() === iso.toUpperCase()) ||
      (r.id && (r.id === geoId || r.id === iso)) ||
      (r.iso2 && r.iso2.toUpperCase() === geoId.toUpperCase()),
  );
}

export function GlobalSubmissionMap({
  regions = [],
  points = [],
  pins = [],
  height = 300,
  heatFrom = "#d9e5c9",
  heatTo = "#4a5832",
}: GlobalSubmissionMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="animate-pulse rounded-xl bg-neutral-100/50 dark:bg-zinc-800/30 w-full"
        style={{ height }}
      />
    );
  }

  const maxValue = Math.max(...regions.map((d) => Number(d.value)), 1);
  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range([heatFrom, heatTo]);

  const validPoints = points.filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
  );
  const validPins = pins.filter(
    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
  );

  return (
    <div className="w-full flex items-center justify-center" style={{ height }}>
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const d = findRegion(geo, regions);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={d ? colorScale(Number(d.value)) : "#f5f5f4"}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: d ? "#2d351e" : "#e7e5e4", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {validPoints.map((pt, i) => (
          <Marker key={`pt-${i}`} coordinates={[pt.lng, pt.lat]}>
            <circle
              r={Math.min(Math.max(Number(pt.value) * 2, 5), 14)}
              fill="#ef4444"
              fillOpacity={0.65}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          </Marker>
        ))}

        {validPins.map((pin, i) => (
          <Marker key={`pin-${i}`} coordinates={[pin.lng, pin.lat]}>
            <circle r={3.5} fill="#18181b" stroke="#ffffff" strokeWidth={1} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
