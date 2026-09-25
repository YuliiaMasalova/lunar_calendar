import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AstroData } from '../types/astro';
import type { DayContent } from '../types/content';
import { buildDayCard } from '../services/knowledge/KnowledgeService';

export interface DayCardContent {
  /** One content block per active lunar day (double/triple days -> multiple). SPEC §7.1. */
  blocks: { lunarDay: number; content: DayContent }[];
  /** True when any block fell back to the base language (SPEC §7.5). */
  fallback: boolean;
}

/**
 * Merge Layer A (real astronomy) + Layer B (RU knowledge base) into the day card.
 * KB is RU-only; UK/EN fall back to RU with a banner (SPEC §7.5).
 */
export function useDayCard(astro: AstroData | undefined): DayCardContent {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  // Re-run when the date's lunar-day set, zodiac, aspects or language change.
  const key = astro
    ? `${astro.date}|${astro.lunar_days.join(',')}|${astro.zodiac_sign}|${astro.aspects?.length ?? 0}|${lang}`
    : `none|${lang}`;

  return useMemo(() => {
    if (!astro) return { blocks: [], fallback: false };
    return buildDayCard(astro, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
