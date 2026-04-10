/**
 * MobileHeader — Task 63 (C.3)
 *
 * Screen-level header with iOS-style large title, optional back link,
 * and right-side action slot.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const MobileHeader = ({ title, subtitle, action, backTo }) => {
  const { t } = useTranslation('ess');

  return (
    <div className="px-4 pt-2 pb-4" data-testid="mobile-header">
      {backTo && (
        <Link
          to={backTo}
          className="flex items-center gap-1 text-[var(--mobile-tint)] text-mobile-body mb-2 touch-target w-fit"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          {t('mobile.back')}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-mobile-largeTitle text-[var(--mobile-label-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-mobile-subheadline text-[var(--mobile-label-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
};

export default MobileHeader;
