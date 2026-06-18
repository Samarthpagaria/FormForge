/**
 * Enrich submission meta with geo data from IP when the client did not provide coordinates.
 */
export async function enrichSubmissionMeta(
  meta?: {
    ip?: string;
    userAgent?: string;
    country?: string;
    lat?: number;
    lng?: number;
    completionTime?: number;
    device?: "desktop" | "mobile" | "tablet";
    browser?: string;
    os?: string;
  },
) {
  if (!meta) return meta;

  const hasValidIso =
    meta.country &&
    meta.country !== "Unknown" &&
    meta.country.length <= 3;

  if (meta.lat != null && meta.lng != null && hasValidIso) {
    return {
      ...meta,
      country: meta.country!.trim().toUpperCase(),
    };
  }

  const ip = meta.ip;
  if (!ip || ip === "unknown") return meta;

  try {
    const res = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return meta;

    const geo = (await res.json()) as {
      country_code?: string;
      country?: string;
      latitude?: string;
      longitude?: string;
    };

    return {
      ...meta,
      country: geo.country_code
        ? geo.country_code.trim().toUpperCase()
        : meta.country?.trim().toUpperCase(),
      lat:
        meta.lat ??
        (geo.latitude ? parseFloat(geo.latitude) : undefined),
      lng:
        meta.lng ??
        (geo.longitude ? parseFloat(geo.longitude) : undefined),
    };
  } catch {
    return meta;
  }
}
