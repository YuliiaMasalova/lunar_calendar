import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { GeoLocation } from '../types/astro';
import { DEFAULT_LOCATION, CITIES } from '../data/cities';
import { roundCoord } from '../utils/date';

type DetectStatus = 'idle' | 'detecting' | 'error';

interface LocationContextValue {
  location: GeoLocation;
  status: DetectStatus;
  setLocation: (loc: GeoLocation) => void;
  detect: () => void;
}

const STORAGE_KEY = 'auralunar.location';

const LocationContext = createContext<LocationContextValue | null>(null);

function loadSaved(): GeoLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GeoLocation>;
    if (
      typeof parsed.lat === 'number' &&
      typeof parsed.lon === 'number' &&
      typeof parsed.city === 'string'
    ) {
      return { lat: parsed.lat, lon: parsed.lon, city: parsed.city };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function save(loc: GeoLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    /* ignore */
  }
}

function nearestCity(lat: number, lon: number): GeoLocation {
  let best = CITIES[0];
  let bestDist = Infinity;
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('geocode failed');
    const data = (await res.json()) as {
      address?: { city?: string; town?: string; village?: string; state?: string };
    };
    const a = data.address ?? {};
    return a.city ?? a.town ?? a.village ?? a.state ?? nearestCity(lat, lon).city;
  } catch {
    return nearestCity(lat, lon).city;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<GeoLocation>(
    () => loadSaved() ?? DEFAULT_LOCATION,
  );
  const [status, setStatus] = useState<DetectStatus>('idle');
  const hasSaved = useRef(loadSaved() !== null);

  const setLocation = useCallback((loc: GeoLocation) => {
    const normalized: GeoLocation = {
      lat: roundCoord(loc.lat),
      lon: roundCoord(loc.lon),
      city: loc.city,
    };
    setLocationState(normalized);
    save(normalized);
    setStatus('idle');
  }, []);

  const detect = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    setStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = await reverseGeocode(latitude, longitude);
        setLocation({ lat: latitude, lon: longitude, city });
      },
      () => {
        // Refusal / failure — keep default (Kyiv). SPEC §6.4.
        setStatus('error');
      },
      { timeout: 8000 },
    );
  }, [setLocation]);

  // On the very first visit (no saved location) request geolocation once (SPEC §6.1).
  useEffect(() => {
    if (!hasSaved.current) {
      hasSaved.current = true;
      detect();
    }
  }, [detect]);

  const value = useMemo<LocationContextValue>(
    () => ({ location, status, setLocation, detect }),
    [location, status, setLocation, detect],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
