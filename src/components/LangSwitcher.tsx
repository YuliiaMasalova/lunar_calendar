import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type AppLang } from '../i18n';

const LABELS: Record<AppLang, string> = { en: 'EN', ru: 'RU', uk: 'UK' };

/** SPEC §5.1 / §9.11 — EN | RU | UK switcher. */
export function LangSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language as AppLang) in LABELS ? (i18n.language as AppLang) : 'ru';

  return (
    <div role="group" aria-label={t('lang.label')} className="flex items-center gap-8">
      {SUPPORTED_LANGS.map((lang, index) => {
        const active = lang === current;
        return (
          <Fragment key={lang}>
            {index > 0 && <span className="text-text-disabled">|</span>}
            <button
              type="button"
              aria-pressed={active}
              onClick={() => void i18n.changeLanguage(lang)}
              className={
                active
                  ? 'px-4 text-label-md-strong text-text-primary'
                  : 'px-4 text-label-md-regular text-text-secondary transition-colors hover:text-accent'
              }
            >
              {LABELS[lang]}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
