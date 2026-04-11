/**
 * StatusChip — Task 63 (C.4)
 *
 * Compact inline badge for displaying status with semantic colour variants.
 */
const variants = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const StatusChip = ({ label, variant = 'neutral', icon: Icon }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-mobile-caption font-medium ${
      variants[variant] || variants.neutral
    }`}
    data-testid="status-chip"
  >
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {label}
  </span>
);

export default StatusChip;
