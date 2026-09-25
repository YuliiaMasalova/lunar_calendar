import { useEffect, useId, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CategoryKey } from '../types/content';
import { useAstro } from '../hooks/useAstro';
import { useDayCard } from '../hooks/useDayCard';
import { isSameDay, parseISODate, todayISO } from '../utils/date';
import { formatDateLong } from '../utils/format';
import { DayHero } from '../components/DayHero';
import { CategoryTabs } from '../components/CategoryTabs';
import { CategoryContent } from '../components/CategoryContent';
import { PlanetaryAspects } from '../components/PlanetaryAspects';
import { DayParameters } from '../components/DayParameters';
import { Skeleton } from '../components/states/Skeleton';
import { ErrorState } from '../components/states/ErrorState';

export function DailyForecast() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('health_and_body');
  const panelId = useId();

  const parsed = date ? parseISODate(date) : null;

  const iso = parsed ? date! : todayISO();
  const astroQuery = useAstro(iso);
  const dayCard = useDayCard(astroQuery.data);

  // Invalid URL -> soft redirect to today (SPEC §6.4).
  useEffect(() => {
    if (date && !parsed) navigate(`/day/${todayISO()}`, { replace: true });
  }, [date, parsed, navigate]);

  if (date && !parsed) return <Navigate to={`/day/${todayISO()}`} replace />;

  const targetDate = parsed ?? new Date();
  const isToday = isSameDay(targetDate, new Date());
  const eyebrow = isToday
    ? t('daily:eyebrowToday')
    : formatDateLong(targetDate, i18n.language);

  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-16 py-24 md:px-24">
      {offline && astroQuery.data && (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-16 py-8 text-caption-sm text-warning">
          {t('offline')}
        </p>
      )}

      {astroQuery.isLoading && (
        <div className="flex flex-col gap-24">
          <Skeleton className="h-[220px] rounded-2xl" />
          <Skeleton className="h-12 w-1/2" />
          <div className="grid gap-24 md:grid-cols-3">
            <Skeleton className="h-[240px] rounded-xl md:col-span-2" />
            <Skeleton className="h-[240px] rounded-xl" />
          </div>
        </div>
      )}

      {astroQuery.isError && !astroQuery.data && (
        <ErrorState onRetry={() => void astroQuery.refetch()} />
      )}

      {astroQuery.data && (
        <>
          <DayHero
            astro={astroQuery.data}
            motto={dayCard.blocks[0]?.content.motto ?? ''}
            eyebrow={eyebrow}
          />

          {dayCard.fallback && (
            <p className="text-center text-caption-sm text-warning">{t('daily:fallbackNote')}</p>
          )}

          <CategoryTabs active={activeCategory} onChange={setActiveCategory} panelId={panelId} />

          <div className="grid gap-24 md:grid-cols-12">
            <div id={panelId} role="tabpanel" className="flex min-w-0 flex-col gap-24 md:col-span-7">
              <CategoryContent blocks={dayCard.blocks} category={activeCategory} />
            </div>

            <div className="flex min-w-0 flex-col gap-24 md:col-span-5">
              <PlanetaryAspects aspects={dayCard.blocks[0]?.content.planetary_aspects ?? []} />
              <DayParameters astro={astroQuery.data} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
