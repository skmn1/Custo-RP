import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

/**
 * StaleDataIndicator — Task 58
 *
 * Shows "Last updated X minutes ago" when data was served from the SW cache
 * (detected via the `x-sw-cache-hit: true` response header).
 *
 * Props:
 *   fetchedAt  — Date object or ISO string of when the data was fetched
 *   isCached   — boolean; only renders when true
 */
export default function StaleDataIndicator({ fetchedAt, isCached }) {
  const { t, i18n } = useTranslation('ess');

  if (!isCached || !fetchedAt) return null;

  const locale = i18n.language?.startsWith('fr') ? fr : enUS;
  const date = fetchedAt instanceof Date ? fetchedAt : new Date(fetchedAt);

  const relativeTime = formatDistanceToNow(date, { addSuffix: true, locale });

  return (
    <p
      data-testid="stale-data-indicator"
      className="text-xs text-gray-500 mt-1"
    >
      {t('pwa.offline.lastUpdated', { time: relativeTime })}
    </p>
  );
}
