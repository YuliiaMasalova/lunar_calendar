import type { GeoLocation } from '../types/astro';

/** A location result with a human display label (city + country). */
export interface CitySearchResult extends GeoLocation {
  /** Display label, e.g. "Донецьк, Україна". Falls back to the city name. */
  label: string;
}

/**
 * Offline city directory for the LocationPicker typeahead (SPEC §6.1).
 * Used for instant local matches and as a fallback when the online geocoder
 * (Nominatim) is unavailable. The live search (geocodeCities) covers any city.
 */
export const CITIES: GeoLocation[] = [
  { city: 'Kyiv', lat: 50.45, lon: 30.52 },
  { city: 'Lviv', lat: 49.84, lon: 24.03 },
  { city: 'Odesa', lat: 46.48, lon: 30.72 },
  { city: 'Kharkiv', lat: 49.99, lon: 36.23 },
  { city: 'Dnipro', lat: 48.46, lon: 35.05 },
  { city: 'Donetsk', lat: 48.02, lon: 37.8 },
  { city: 'Zaporizhzhia', lat: 47.84, lon: 35.14 },
  { city: 'Vinnytsia', lat: 49.23, lon: 28.47 },
  { city: 'Mykolaiv', lat: 46.98, lon: 31.99 },
  { city: 'Poltava', lat: 49.59, lon: 34.55 },
  { city: 'Chernihiv', lat: 51.5, lon: 31.29 },
  { city: 'Cherkasy', lat: 49.44, lon: 32.06 },
  { city: 'Ivano-Frankivsk', lat: 48.92, lon: 24.71 },
  { city: 'Ternopil', lat: 49.55, lon: 25.59 },
  { city: 'Uzhhorod', lat: 48.62, lon: 22.29 },
  { city: 'Warsaw', lat: 52.23, lon: 21.01 },
  { city: 'Berlin', lat: 52.52, lon: 13.41 },
  { city: 'London', lat: 51.51, lon: -0.13 },
  { city: 'Paris', lat: 48.86, lon: 2.35 },
  { city: 'Madrid', lat: 40.42, lon: -3.7 },
  { city: 'Rome', lat: 41.9, lon: 12.5 },
  { city: 'Vienna', lat: 48.21, lon: 16.37 },
  { city: 'Prague', lat: 50.08, lon: 14.44 },
  { city: 'Amsterdam', lat: 52.37, lon: 4.9 },
  { city: 'Istanbul', lat: 41.01, lon: 28.98 },
  { city: 'New York', lat: 40.71, lon: -74.01 },
  { city: 'Los Angeles', lat: 34.05, lon: -118.24 },
  { city: 'Toronto', lat: 43.65, lon: -79.38 },
  { city: 'Tokyo', lat: 35.68, lon: 139.69 },
  { city: 'Sydney', lat: -33.87, lon: 151.21 },
];

export const DEFAULT_LOCATION: GeoLocation = CITIES[0];

/** Instant local matches from the bundled directory. */
export function searchLocalCities(query: string, limit = 8): CitySearchResult[] {
  const q = query.trim().toLowerCase();
  const list = q ? CITIES.filter((c) => c.city.toLowerCase().includes(q)) : CITIES;
  return list.slice(0, limit).map((c) => ({ ...c, label: c.city }));
}

interface NominatimSearchItem {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

/** Stable de-dupe key for a location. */
function locKey(name: string, lat: number, lon: number): string {
  return `${name.toLowerCase()}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
}

/**
 * Live geocoding search via Nominatim (OpenStreetMap) — resolves ANY city.
 * Returns [] for very short queries. Throws on network/HTTP error so the caller
 * can show an error state and fall back to local matches (SPEC §6.1, §10:
 * coordinates go only to the geocoder, nowhere else).
 */
export async function geocodeCities(
  query: string,
  lang: string,
  signal?: AbortSignal,
  limit = 8,
): Promise<CitySearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(q)}&addressdetails=1&accept-language=${lang}&limit=${limit}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('geocode failed');
  const data = (await res.json()) as NominatimSearchItem[];

  const out: CitySearchResult[] = [];
  const seen = new Set<string>();
  for (const it of data) {
    const a = it.address ?? {};
    const name = a.city ?? a.town ?? a.village ?? a.hamlet ?? a.municipality ?? it.name;
    if (!name) continue;
    const lat = Number.parseFloat(it.lat);
    const lon = Number.parseFloat(it.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const key = locKey(name, lat, lon);
    if (seen.has(key)) continue;
    seen.add(key);
    const region = a.state && a.country ? `${a.state}, ${a.country}` : a.country;
    out.push({ city: name, lat, lon, label: region ? `${name}, ${region}` : name });
  }
  return out;
}

/** Merge instant local matches with remote ones, local first, de-duplicated. */
export function mergeCityResults(
  local: CitySearchResult[],
  remote: CitySearchResult[],
  limit = 8,
): CitySearchResult[] {
  const seen = new Set(local.map((c) => locKey(c.city, c.lat, c.lon)));
  const merged = [...local];
  for (const r of remote) {
    const key = locKey(r.city, r.lat, r.lon);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged.slice(0, limit);
}
