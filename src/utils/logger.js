/**
 * Minimal structured logger for Staff Scheduler Pro.
 *
 * Format: [Module] icon  message  {optional data}
 *
 * In production only warn/error are emitted.
 * In development all levels are shown.
 */

const IS_DEV = import.meta.env.DEV;

const ICON = { debug: '·', info: 'ℹ', warn: '⚠', error: '✖' };

function emit(level, module, message, data) {
  if (!IS_DEV && (level === 'debug' || level === 'info')) return;
  const tag = `%c[${module}]`;
  const style = {
    debug: 'color:#9ca3af',
    info:  'color:#3b82f6',
    warn:  'color:#f59e0b;font-weight:600',
    error: 'color:#ef4444;font-weight:600',
  }[level];
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (data !== undefined) {
    fn(tag, style, `${ICON[level]}  ${message}`, data);
  } else {
    fn(tag, style, `${ICON[level]}  ${message}`);
  }
}

/**
 * Create a logger scoped to a module name.
 * @param {string} module  Short label, e.g. 'Shifts', 'Auth'
 */
export function createLogger(module) {
  return {
    debug: (msg, data) => emit('debug', module, msg, data),
    info:  (msg, data) => emit('info',  module, msg, data),
    warn:  (msg, data) => emit('warn',  module, msg, data),
    error: (msg, data) => emit('error', module, msg, data),
  };
}
