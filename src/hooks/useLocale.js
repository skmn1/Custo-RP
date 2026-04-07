/**
 * useLocale — read/change the active UI language.
 *
 * Persists the user's choice to localStorage and keeps <html lang> in sync.
 */
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n';

const STORAGE_KEY = 'scheduler.locale';

export function useLocale() {
  const { i18n } = useTranslation();

  const language = (i18n.language || DEFAULT_LANGUAGE).slice(0, 2);

  const setLocale = useCallback(
    (next) => {
      const normalized = (next || DEFAULT_LANGUAGE).slice(0, 2);
      if (!SUPPORTED_LANGUAGES.includes(normalized)) return;
      i18n.changeLanguage(normalized);
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        /* ignore */
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = normalized;
      }
    },
    [i18n]
  );

  const toggleLocale = useCallback(() => {
    setLocale(language === 'fr' ? 'en' : 'fr');
  }, [language, setLocale]);

  return {
    language,
    locale: language === 'fr' ? 'fr-FR' : 'en-US',
    setLocale,
    toggleLocale,
    isFrench: language === 'fr',
    isEnglish: language === 'en',
    supported: SUPPORTED_LANGUAGES,
  };
}

export default useLocale;
