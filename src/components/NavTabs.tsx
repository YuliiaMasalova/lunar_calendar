import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { todayISO } from '../utils/date';

/** SPEC §5.1 / §9.10 — Today / Monthly navigation tabs. */
export function NavTabs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const today = todayISO();
  const now = new Date();
  const calendarPath = `/calendar/${now.getFullYear()}/${now.getMonth() + 1}`;

  const isToday = pathname.startsWith('/day');
  const isCalendar = pathname.startsWith('/calendar');

  // Full-width stacked on mobile (Figma 249:2481 / 278:4539), inline on desktop.
  const base =
    'w-full rounded-lg border px-24 py-12 text-center text-label-sm tracking-wide transition-colors md:w-auto md:text-left';
  const active = 'border-border-primary bg-surface-panel text-text-primary';
  const idle =
    'border-transparent text-text-secondary hover:border-border-secondary hover:bg-card-primary';

  return (
    <nav
      role="tablist"
      aria-label={t('app.name')}
      className="flex w-full flex-col gap-8 md:w-auto md:flex-row md:items-center"
    >
      <NavLink
        to={`/day/${today}`}
        role="tab"
        aria-current={isToday ? 'page' : undefined}
        aria-selected={isToday}
        className={`${base} ${isToday ? active : idle}`}
      >
        {t('nav.today')}
      </NavLink>
      <NavLink
        to={calendarPath}
        role="tab"
        aria-current={isCalendar ? 'page' : undefined}
        aria-selected={isCalendar}
        className={`${base} ${isCalendar ? active : idle}`}
      >
        {t('nav.calendar')}
      </NavLink>
    </nav>
  );
}
