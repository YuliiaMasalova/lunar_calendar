import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import {
  geocodeCities,
  mergeCityResults,
  searchLocalCities,
  type CitySearchResult,
} from '../data/cities';
import { formatLatitude } from '../utils/format';
import { MapPin } from './icons';

type SearchStatus = 'idle' | 'loading' | 'error';

/** SPEC §5.1 / §6.1 — location indicator + typeahead city picker. */
export function LocationPicker() {
  const { t, i18n } = useTranslation();
  const { location, status, setLocation, detect } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<CitySearchResult[]>(() => searchLocalCities(''));
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Typeahead: instant local matches, then merge live geocoder results (debounced).
  useEffect(() => {
    setActiveIndex(0);
    const local = searchLocalCities(query);
    setResults(local);

    const q = query.trim();
    if (q.length < 2) {
      setSearchStatus('idle');
      return;
    }

    const lang = (i18n.language || 'en').slice(0, 2);
    const controller = new AbortController();
    setSearchStatus('loading');
    const timer = setTimeout(() => {
      geocodeCities(q, lang, controller.signal)
        .then((remote) => {
          setResults(mergeCityResults(local, remote));
          setSearchStatus('idle');
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // Network/geocoder unavailable — keep local matches as fallback.
          setSearchStatus('error');
        });
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, i18n.language]);

  const label = `${location.city.toUpperCase()} ${formatLatitude(location.lat)}`;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = results[activeIndex];
      if (picked) {
        setLocation(picked);
        setOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('location.label')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-8 rounded-lg px-8 py-4 text-label-sm text-text-secondary transition-colors hover:text-accent"
      >
        <span className="inline-block h-8 w-8 rounded-full bg-accent" aria-hidden="true" />
        <span className="tracking-wide">{label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('location.label')}
          className="absolute left-0 top-full z-20 mt-8 w-72 rounded-xl border border-border-primary bg-bg-secondary p-12 shadow-card"
        >
          <div className="flex items-center gap-8 rounded-lg border border-border-primary bg-bg-primary px-12 py-8">
            <MapPin className="text-text-tertiary" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={
                results[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined
              }
              aria-autocomplete="list"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('location.placeholder')}
              className="w-full bg-transparent text-label-md-regular text-text-primary placeholder:text-text-disabled focus:outline-none"
            />
          </div>

          <ul id={listId} role="listbox" className="mt-8 max-h-56 overflow-auto no-scrollbar">
            {results.map((city, index) => {
              const selected = index === activeIndex;
              return (
                <li key={`${city.label}-${city.lat},${city.lon}`} role="none">
                  <button
                    type="button"
                    id={`${listId}-opt-${index}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      setLocation({ city: city.city, lat: city.lat, lon: city.lon });
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center justify-between gap-8 rounded-md px-12 py-8 text-left text-label-md-regular transition-colors ${
                      selected ? 'bg-surface-panel text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    <span className="truncate">{city.label}</span>
                    <span className="shrink-0 text-caption-sm text-text-tertiary">
                      {formatLatitude(city.lat)}
                    </span>
                  </button>
                </li>
              );
            })}

            {searchStatus === 'loading' && (
              <li className="px-12 py-8 text-caption-sm text-text-tertiary">
                {t('location.searching')}
              </li>
            )}
            {results.length === 0 && searchStatus === 'error' && (
              <li className="px-12 py-8 text-caption-sm text-error">
                {t('location.searchError')}
              </li>
            )}
            {results.length === 0 && searchStatus === 'idle' && query.trim().length >= 2 && (
              <li className="px-12 py-8 text-caption-sm text-text-tertiary">
                {t('location.empty')}
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={detect}
            className="mt-8 w-full rounded-md border border-border-primary px-12 py-8 text-label-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            {status === 'detecting' ? t('location.detecting') : t('location.detect')}
          </button>

          {status === 'error' && (
            <p className="mt-8 text-caption-sm text-error">{t('location.error')}</p>
          )}
          <p className="mt-8 text-caption-sm text-text-tertiary">{t('location.privacy')}</p>
        </div>
      )}
    </div>
  );
}
