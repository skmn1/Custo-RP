import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

const FONT_SIZE_MAP = { small: '14px', medium: '16px', large: '18px' };

/**
 * Applies accessibility preferences (fontSize, highContrast, reducedMotion,
 * focusRingAlwaysVisible) to the <html> element so they affect the entire app.
 * Renders nothing — purely a side-effect component.
 */
const AccessibilityEffects = () => {
  const { preferences } = useSettings();

  useEffect(() => {
    const html = document.documentElement;

    // Font size
    html.style.fontSize = FONT_SIZE_MAP[preferences.fontSize] || FONT_SIZE_MAP.medium;

    // High contrast
    html.classList.toggle('high-contrast', Boolean(preferences.highContrast));

    // Reduced motion
    html.classList.toggle('reduce-motion', Boolean(preferences.reducedMotion));

    // Focus ring always visible
    html.classList.toggle('focus-visible-always', Boolean(preferences.focusRingAlwaysVisible));

    return () => {
      html.style.fontSize = '';
      html.classList.remove('high-contrast', 'reduce-motion', 'focus-visible-always');
    };
  }, [preferences.fontSize, preferences.highContrast, preferences.reducedMotion, preferences.focusRingAlwaysVisible]);

  return null;
};

export default AccessibilityEffects;
