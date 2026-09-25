import { useQuery } from '@tanstack/react-query';
import type { AstroData, GeoLocation, ISODate } from '../types/astro';
import { lunarEngine } from '../services/LunarEngineService';
import { useLocation } from '../context/LocationContext';
import { roundCoord, toISODate } from '../utils/date';

const DAY_MS = 24 * 60 * 60 * 1000;

function locationKey(loc: GeoLocation): string {
  return `${roundCoord(loc.lat)},${roundCoord(loc.lon)}`;
}

/** Single day (SPEC §6.3: cache key = date + rounded location, TTL 24h). */
export function useAstro(date: ISODate) {
  const { location } = useLocation();
  return useQuery<AstroData>({
    queryKey: ['astro', date, locationKey(location)],
    queryFn: () => lunarEngine.getForDate(date, location),
    staleTime: DAY_MS,
    gcTime: DAY_MS,
  });
}

/** All astro packets for the dates of a month grid, keyed by ISO date. */
export function useMonthAstro(dates: Date[]) {
  const { location } = useLocation();
  const isoDates = dates.map(toISODate);
  const rangeKey = isoDates.length ? `${isoDates[0]}_${isoDates[isoDates.length - 1]}` : 'empty';

  return useQuery<Map<ISODate, AstroData>>({
    queryKey: ['astro-month', rangeKey, locationKey(location)],
    queryFn: async () => {
      const entries = await Promise.all(
        isoDates.map(async (iso): Promise<[ISODate, AstroData]> => [
          iso,
          await lunarEngine.getForDate(iso, location),
        ]),
      );
      return new Map(entries);
    },
    staleTime: DAY_MS,
    gcTime: DAY_MS,
  });
}
