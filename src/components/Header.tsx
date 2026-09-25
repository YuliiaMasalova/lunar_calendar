import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocationPicker } from './LocationPicker';
import { NavTabs } from './NavTabs';
import { LangSwitcher } from './LangSwitcher';
import { MoonLogo } from './icons';

/** SPEC §5.1 — shared header. Mobile (Figma 249:2481 / 278:4539): logo + location
 * on row 1 with the language switch at the right, nav tabs full-width on row 2.
 * Desktop: everything inline (logo, location … nav tabs, language). */
export function Header() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 border-b border-border-secondary bg-bg-primary/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-16 py-16 md:flex-row md:items-center md:gap-24 md:px-32">
        {/* Row 1 (mobile): logo + location on the left, language on the right.
            `md:contents` dissolves this wrapper so the pieces flow inline on desktop. */}
        <div className="flex items-center justify-between gap-16 md:contents">
          <div className="flex items-center gap-16 md:gap-24">
            <Link
              to="/"
              className="flex items-center gap-8 text-text-primary transition-colors hover:text-accent"
            >
              <MoonLogo className="text-accent" />
              <span className="hidden text-label-md-strong tracking-wide md:inline">
                {t('app.name')}
              </span>
            </Link>
            <LocationPicker />
          </div>
          <div className="md:hidden">
            <LangSwitcher />
          </div>
        </div>

        {/* Row 2 (mobile): nav tabs full-width; desktop: nav tabs + language, pushed right. */}
        <div className="flex items-center gap-24 md:ml-auto">
          <NavTabs />
          <div className="hidden md:block">
            <LangSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
