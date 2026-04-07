import { useSettings } from '../hooks/useSettings';

/**
 * Renders children only when the named feature flag is enabled.
 * Usage: <FeatureFlag flag="enablePayroll"><PayrollPage /></FeatureFlag>
 */
const FeatureFlag = ({ flag, children, fallback = null }) => {
  const { featureFlags } = useSettings();
  return featureFlags[flag] ? children : fallback;
};

export default FeatureFlag;
