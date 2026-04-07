/**
 * Locale-aware formatting helpers.
 *
 * - Currency is hard-coded to EUR per business rule. Only the
 *   number/separator/spacing conventions change with the active locale.
 * - Date helpers wrap date-fns and inject the matching locale.
 */
import { useMemo } from 'react';
import { format as dfFormat, formatDistance as dfFormatDistance } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import useLocale from '../hooks/useLocale';

const CURRENCY = 'EUR';

export function useLocaleFormat() {
  const { locale } = useLocale();

  return useMemo(() => {
    const numberFmt = new Intl.NumberFormat(locale);
    const currencyFmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: CURRENCY,
    });
    const percentFmt = new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    });
    const decimalFmt = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });

    return {
      locale,
      formatNumber: (n) =>
        n == null || Number.isNaN(Number(n)) ? '—' : numberFmt.format(Number(n)),
      formatDecimal: (n) =>
        n == null || Number.isNaN(Number(n)) ? '—' : decimalFmt.format(Number(n)),
      formatCurrency: (n) =>
        n == null || Number.isNaN(Number(n)) ? '—' : currencyFmt.format(Number(n)),
      formatHours: (n) => {
        if (n == null || Number.isNaN(Number(n))) return '—';
        const v = decimalFmt.format(Number(n));
        return locale === 'fr-FR' ? `${v} h` : `${v} h`;
      },
      formatPercent: (n) => {
        if (n == null || Number.isNaN(Number(n))) return '—';
        // Accept 0..1 OR 0..100 — assume 0..100 if > 1
        const num = Number(n);
        const ratio = num > 1 ? num / 100 : num;
        return percentFmt.format(ratio);
      },
    };
  }, [locale]);
}

export function useLocaleDateFns() {
  const { language } = useLocale();
  const dfLocale = language === 'fr' ? frLocale : enLocale;

  return useMemo(
    () => ({
      locale: dfLocale,
      formatDate: (date, fmt = 'PP') => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(d.getTime())) return '';
        return dfFormat(d, fmt, { locale: dfLocale });
      },
      formatDistance: (date, base = new Date()) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return dfFormatDistance(d, base, { locale: dfLocale, addSuffix: true });
      },
    }),
    [dfLocale]
  );
}

export default useLocaleFormat;
