import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enDaily from './locales/en/daily.json';
import enCalendar from './locales/en/calendar.json';
import ruCommon from './locales/ru/common.json';
import ruDaily from './locales/ru/daily.json';
import ruCalendar from './locales/ru/calendar.json';
import ukCommon from './locales/uk/common.json';
import ukDaily from './locales/uk/daily.json';
import ukCalendar from './locales/uk/calendar.json';

export const SUPPORTED_LANGS = ['en', 'ru', 'uk'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'auralunar.lang';

function initialLang(): AppLang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) {
      return saved as AppLang;
    }
  } catch {
    /* storage may be unavailable */
  }
  return 'ru';
}

export const resources = {
  en: { common: enCommon, daily: enDaily, calendar: enCalendar },
  ru: { common: ruCommon, daily: ruDaily, calendar: ruCalendar },
  uk: { common: ukCommon, daily: ukDaily, calendar: ukCalendar },
} as const;

const startLang = initialLang();

void i18n.use(initReactI18next).init({
  resources,
  lng: startLang,
  fallbackLng: 'ru',
  ns: ['common', 'daily', 'calendar'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

// Set <html lang> at init too (a saved uk/en language must not leave lang="ru").
document.documentElement.lang = startLang;

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lng;
});

export default i18n;
