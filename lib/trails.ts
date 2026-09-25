export type TrailKind = 'park' | 'trail' | 'nature';

export interface Trail {
  id: string;
  name: string;
  kind: TrailKind;
  lat: number;
  lon: number;
  distanceKm: number;
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 6000;

/** Great-circle distance between two coordinates, in kilometers. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function kindFromTags(tags: Record<string, string> = {}): TrailKind {
  if (tags.route === 'hiking' || tags.highway === 'path' || tags.highway === 'footway') return 'trail';
  if (tags.natural) return 'nature';
  return 'park';
}

/** Queries OpenStreetMap's Overpass API for parks, nature areas and hiking
 * routes near a coordinate. Requires network access; throws on failure so
 * callers can show a retry state. */
export async function fetchNearbyTrails(lat: number, lon: number): Promise<Trail[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["leisure"="park"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["leisure"="park"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["leisure"="nature_reserve"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["leisure"="nature_reserve"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["route"="hiking"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      way["highway"="path"]["name"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
    );
    out center 40;
  `;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data: { elements: OverpassElement[] } = await response.json();

  const seen = new Set<string>();
  const trails: Trail[] = [];

  for (const el of data.elements) {
    const name = el.tags?.name;
    if (!name) continue;
    if (seen.has(name)) continue;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (elLat == null || elLon == null) continue;

    seen.add(name);
    trails.push({
      id: `${el.id}`,
      name,
      kind: kindFromTags(el.tags),
      lat: elLat,
      lon: elLon,
      distanceKm: haversineKm(lat, lon, elLat, elLon),
    });
  }

  return trails.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20);
}
