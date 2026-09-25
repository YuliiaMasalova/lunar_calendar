import { useTranslation } from 'react-i18next';
import { useLocation } from '../context/LocationContext';
import { formatLatitude } from '../utils/format';

/** SPEC §5.1 — shared footer with the active location coordinates. */
export function Footer() {
  const { t } = useTranslation();
  const { location } = useLocation();
  const lonHemi = location.lon >= 0 ? 'E' : 'W';
  const coords = `${location.city} ${formatLatitude(location.lat)} ${Math.abs(location.lon).toFixed(2)}° ${lonHemi}`;

  return (
    <footer className="mt-48 border-t border-border-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-16 py-24 text-caption-sm text-text-tertiary md:flex-row md:items-center md:justify-between md:px-24">
        <span>{t('footer.engine')}</span>
        <span>{t('footer.copyright', { coords, year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  );
}
