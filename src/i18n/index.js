/**
 * i18next configuration for Staff Scheduler Pro.
 *
 * - HTTP backend loads JSON namespaces from /locales/{{lng}}/{{ns}}.json
 * - Browser language detector with localStorage persistence
 * - French is the primary language; English is the fallback
 */
import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['fr', 'en'];
export const DEFAULT_LANGUAGE = 'fr';

export const NAMESPACES = [
  'common',
  'scheduler',
  'employees',
  'payroll',
  'auth',
  'timeOff',
  'swaps',
  'mobile',
  'pos',
  'validation',
  'settings',
  'stock',
  'invoices',
  'apps',
];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: { default: ['fr', 'en'] },
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'languageOnly',
    ns: NAMESPACES,
    defaultNS: 'common',
    fallbackNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'scheduler.locale',
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: true,
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] missing key: ${ns}:${key} (${lngs.join(',')})`);
      }
    },
    returnNull: false,
  });

// Keep <html lang> in sync
if (typeof document !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
