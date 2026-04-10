import { useTranslation } from 'react-i18next';
import { useEssConnectivity } from '../../contexts/EssConnectivityContext';

/**
 * OfflineDisabled — Task 58
 *
 * Wraps any action (button, link, form) and disables it when the device is
 * offline. Shows a tooltip-like title attribute explaining why.
 *
 * Props:
 *   children        — the element(s) to wrap
 *   fallbackTooltip — optional override for the tooltip / title text
 *   className       — optional extra classes on the wrapper
 */
export default function OfflineDisabled({ children, fallbackTooltip, className = '' }) {
  const { isOnline } = useEssConnectivity();
  const { t } = useTranslation('ess');

  if (isOnline) return children;

  const tooltip = fallbackTooltip ?? t('pwa.offline.requiresInternet', 'Requires internet connection');

  return (
    <span
      title={tooltip}
      aria-disabled="true"
      data-testid="offline-disabled-wrapper"
      className={`inline-block cursor-not-allowed opacity-50 pointer-events-none ${className}`}
    >
      {children}
    </span>
  );
}
