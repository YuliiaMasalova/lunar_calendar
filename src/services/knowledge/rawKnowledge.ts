// Typed views over the knowledge base (src/knowledge-base) — Layer B.
//
// Russian is the canonical, complete set and lives in the folder root. Ukrainian and
// English live in `uk/` and `en/` with the SAME file names, schema and ids. A missing
// file or record is not an error: KnowledgeService falls back to the Russian entry and
// flags it (SPEC §7.5), so a language can be added or completed incrementally.

export type KbLang = 'ru' | 'uk' | 'en';

export interface LunarDayKB {
  id: number;
  title: string;
  status: string;
  health_and_body: {
    biorhythmic_status: string;
    resonance: string;
    recommended: string;
    caution: string;
  };
  beauty_and_hair: string;
  business_and_tasks: string;
  dreams_and_intuition: string;
  talismans_and_stones: string;
  symbol: string;
}

export interface MoonTransitKB {
  id: string;
  sign: string;
  symbol: string;
  motto: string;
  description: string;
}

export interface AspectKB {
  id: string;
  title: string;
  ui_badge: string;
  description: string;
}
export interface AspectCategoryKB {
  id: string;
  name: string;
  ui_color: string;
  aspects: AspectKB[];
}

export interface RetroKB {
  id: string;
  name: string;
  influence: string;
  meaning: string;
}

export interface EclipseKB {
  type: string;
  short: string;
  description: string;
}

export interface EclipseTablesKB {
  solar_eclipses: Record<string, EclipseKB>;
  lunar_eclipses: Record<string, EclipseKB>;
}

export interface KnowledgeBase {
  lunarDays: LunarDayKB[];
  moonTransits: MoonTransitKB[];
  aspectCategories: AspectCategoryKB[];
  retrograde: RetroKB[];
  eclipses: EclipseTablesKB;
}

// Every JSON under src/knowledge-base, keyed by its path relative to this file.
const modules = import.meta.glob<unknown>('../../knowledge-base/**/*.json', {
  eager: true,
  import: 'default',
});

function file<T>(lang: KbLang, name: string): T | undefined {
  const dir = lang === 'ru' ? '' : `${lang}/`;
  return modules[`../../knowledge-base/${dir}${name}.json`] as T | undefined;
}

function buildKb(lang: KbLang): KnowledgeBase {
  return {
    lunarDays:
      file<{ lunar_days: LunarDayKB[] }>(lang, 'lunar_days_complete')?.lunar_days ?? [],
    moonTransits:
      file<{ moon_transits: MoonTransitKB[] }>(lang, 'moon_transits')?.moon_transits ?? [],
    aspectCategories:
      file<{ categories: AspectCategoryKB[] }>(lang, 'planetary_aspects')?.categories ?? [],
    retrograde:
      file<{ retrograde_planets: RetroKB[] }>(lang, 'retrograde_planets')?.retrograde_planets ??
      [],
    eclipses:
      file<EclipseTablesKB>(lang, 'eclipses') ?? { solar_eclipses: {}, lunar_eclipses: {} },
  };
}

const cache = new Map<KbLang, KnowledgeBase>();

/** Normalise any language code to one the KB supports (anything unknown -> ru). */
export function kbLang(lang: string): KbLang {
  return lang === 'uk' || lang === 'en' ? lang : 'ru';
}

/** The knowledge base for a language (built once, then cached). */
export function kbFor(lang: string): KnowledgeBase {
  const l = kbLang(lang);
  let kb = cache.get(l);
  if (!kb) {
    kb = buildKb(l);
    cache.set(l, kb);
  }
  return kb;
}
