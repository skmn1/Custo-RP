/**
 * Tailwind color mappings for app theming.
 * Maps app color names to CSS custom property values and Tailwind classes.
 */
export const APP_COLORS = {
  blue: {
    css: '59 130 246',        // blue-500
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-500',
    ring: 'ring-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'bg-blue-500',
    accentHover: 'hover:bg-blue-600',
  },
  green: {
    css: '34 197 94',         // green-500
    bg: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    text: 'text-green-600',
    border: 'border-green-500',
    ring: 'ring-green-500',
    badge: 'bg-green-100 text-green-700',
    accent: 'bg-green-500',
    accentHover: 'hover:bg-green-600',
  },
  violet: {
    css: '139 92 246',        // violet-500
    bg: 'bg-violet-50',
    bgHover: 'hover:bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-500',
    ring: 'ring-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    accent: 'bg-violet-500',
    accentHover: 'hover:bg-violet-600',
  },
  amber: {
    css: '245 158 11',        // amber-500
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-500',
    ring: 'ring-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500',
    accentHover: 'hover:bg-amber-600',
  },
  orange: {
    css: '249 115 22',        // orange-500
    bg: 'bg-orange-50',
    bgHover: 'hover:bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-500',
    ring: 'ring-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    accent: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
  },
  teal: {
    css: '20 184 166',        // teal-500
    bg: 'bg-teal-50',
    bgHover: 'hover:bg-teal-100',
    text: 'text-teal-600',
    border: 'border-teal-500',
    ring: 'ring-teal-500',
    badge: 'bg-teal-100 text-teal-700',
    accent: 'bg-teal-500',
    accentHover: 'hover:bg-teal-600',
  },
  slate: {
    css: '100 116 139',       // slate-500
    bg: 'bg-slate-50',
    bgHover: 'hover:bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-500',
    ring: 'ring-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    accent: 'bg-slate-500',
    accentHover: 'hover:bg-slate-600',
  },
};

export function getAppColor(colorName) {
  return APP_COLORS[colorName] || APP_COLORS.slate;
}
