import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getEclipsesForYear,
  getRetrogradesForYear,
} from '../services/knowledge/KnowledgeService';
import { useMonthAstro } from '../hooks/useAstro';
import { buildMonthMatrix, isValidYearMonth, toISODate } from '../utils/date';
import { MonthSelector } from '../components/MonthSelector';
import { CalendarGrid } from '../components/CalendarGrid';
import { StatusLegend } from '../components/StatusLegend';
import { RetrogradeBlock } from '../components/RetrogradeBlock';
import { EclipseBlock } from '../components/EclipseBlock';

function currentPath(): string {
  const now = new Date();
  return `/calendar/${now.getFullYear()}/${now.getMonth() + 1}`;
}

export function MonthlyCalendar() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const y = Number(year);
  const m = Number(month);
  const valid = isValidYearMonth(y, m);

  const dates = useMemo(
    () => (valid ? buildMonthMatrix(y, m).flat() : []),
    [valid, y, m],
  );
  const monthQuery = useMonthAstro(dates);

  // Year-level reference data computed from the real ephemeris (memoized per year).
  const retrograde_planets = useMemo(
    () => (valid ? getRetrogradesForYear(y, i18n.language) : []),
    [valid, y, i18n.language],
  );
  const eclipses = useMemo(
    () => (valid ? getEclipsesForYear(y, i18n.language) : []),
    [valid, y, i18n.language],
  );

  if (!valid) return <Navigate to={currentPath()} replace />;

  const today = new Date();
  const selectedDate =
    today.getFullYear() === y && today.getMonth() + 1 === m ? today : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-16 py-24 md:px-24">
      <div className="flex flex-col gap-8">
        <p className="text-label-sm uppercase tracking-[0.2em] text-status-favorable">
          {t('calendar:eyebrow')}
        </p>
        <h1 className="text-3xl font-semibold text-text-primary">{t('calendar:heading')}</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-16">
        <MonthSelector
          year={y}
          month={m}
          onChange={(ny, nm) => navigate(`/calendar/${ny}/${nm}`)}
        />
        <StatusLegend />
      </div>

      <CalendarGrid
        year={y}
        month={m}
        data={monthQuery.data ?? new Map()}
        isLoading={monthQuery.isLoading}
        isError={monthQuery.isError}
        onRetry={() => void monthQuery.refetch()}
        selectedDate={selectedDate}
        onSelectDate={(date) => navigate(`/day/${toISODate(date)}`)}
      />

      <div className="grid gap-24 md:grid-cols-2">
        <RetrogradeBlock items={retrograde_planets} />
        <EclipseBlock items={eclipses} year={y} />
      </div>
    </div>
  );
}
