/**
 * StatusChip — Task 63 (C.4) / Task 77 (Nexus Kinetic)
 *
 * Compact inline badge for displaying status with semantic colour variants.
 * Updated to use Nexus Kinetic Magenta palette tokens.
 */

// Primary status map (approved/pending/declined/active) for task specs
const STATUS_STYLES = {
  approved:  'bg-primary-fixed/30 text-primary',
  pending:   'bg-primary-fixed/50 text-primary',
  declined:  'bg-error-container/40 text-error',
  active:    'bg-primary-container text-on-primary-container',
  processed: 'bg-primary-fixed/30 text-primary',
};

// Semantic variant map (legacy API — maps success/warning/error/info to Nexus tokens)
const VARIANT_STYLES = {
  success: 'bg-[#f0fdf4] text-[#16a34a]',
  warning: 'bg-[#fffbeb] text-[#d97706]',
  error:   'bg-error-container/40 text-error',
  info:    'bg-primary-container text-on-primary-container',
  neutral: 'bg-surface-container text-on-surface-variant',
};

const StatusChip = ({ label, status, variant = 'neutral', icon: Icon }) => {
  const styleClass = status
    ? (STATUS_STYLES[status] || VARIANT_STYLES.neutral)
    : (VARIANT_STYLES[variant] || VARIANT_STYLES.neutral);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styleClass}`}
      data-testid="status-chip"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
};

export default StatusChip;
