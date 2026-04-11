/**
 * MobileLoginPage — Task 79 (SCREEN_128)
 *
 * Full-screen ESS login view styled with the Nexus Kinetic design system.
 * Split-panel layout on ≥768px: editorial brand panel (left) + form (right).
 * Single-column centred form on mobile.
 * No <MobileShell> wrapper — standalone route.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

export const MobileLoginPage = () => {
  const { t } = useTranslation('ess');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  /** Client-side validation — returns true if valid */
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = t('auth.validation.emailRequired', { defaultValue: 'Email is required.' });
    } else if (!emailRegex.test(email)) {
      errors.email = t('auth.validation.emailInvalid', { defaultValue: 'Enter a valid email address.' });
    }
    if (!password) {
      errors.password = t('auth.validation.passwordRequired', { defaultValue: 'Password is required.' });
    } else if (password.length < 8) {
      errors.password = t('auth.validation.passwordMinLength', { defaultValue: 'Password must be at least 8 characters.' });
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/app/ess/dashboard', { replace: true });
    } catch (err) {
      if (err.status === 403) {
        setError(t('auth.error.deactivated', { defaultValue: 'Your account has been deactivated. Please contact your administrator.' }));
      } else if (err.status === 503) {
        setError(t('auth.error.unavailable', { defaultValue: 'Service unavailable. Please try again later.' }));
      } else {
        setError(t('auth.error.invalid', { defaultValue: 'Invalid email or password.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-[#fffbff] text-[#201a1b]">

      {/* ── Left: Editorial brand panel (≥md only) ────────────────────── */}
      <aside className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center p-12 overflow-hidden bg-[#da336b]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#da336b] via-[#da336b]/80 to-transparent" />
        <div className="relative z-10 max-w-xl">
          <span
            className="uppercase tracking-[0.2em] font-bold text-sm mb-6 block"
            style={{ color: '#ffb1c1', fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
          >
            {t('auth.employeePortal', { defaultValue: 'Employee Portal' })}
          </span>
          <h1
            className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] mb-8 text-white"
            style={{ fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)' }}
          >
            {t('auth.appName', { defaultValue: 'ESS' })}
          </h1>
          <p
            className="text-lg leading-relaxed font-medium opacity-90 max-w-md"
            style={{ color: '#ffd9df', fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
          >
            {t('auth.heroTagline', { defaultValue: 'Your gateway to schedules, payslips, and team management — all in one place.' })}
          </p>
        </div>
      </aside>

      {/* ── Right: Login form ──────────────────────────────────────────── */}
      <main className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-[#fffbff]">
        {/* Mobile logo */}
        <div className="md:hidden self-start mb-12">
          <span
            className="text-2xl font-bold tracking-tighter"
            style={{ color: '#da336b', fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)' }}
          >
            {t('auth.appName', { defaultValue: 'ESS' })}
          </span>
        </div>

        <div className="w-full max-w-sm flex flex-col">
          <header className="mb-10">
            <h2
              className="text-3xl font-bold tracking-tight text-[#201a1b]"
              style={{ fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)' }}
            >
              {t('auth.welcomeBack', { defaultValue: 'Welcome Back' })}
            </h2>
            <p
              className="text-[#514345] mt-2 font-medium"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t('auth.loginSubtitle', { defaultValue: 'Sign in to your employee portal.' })}
            </p>
          </header>

          {/* Global error banner */}
          {error && (
            <div
              className="mb-6 p-3 rounded-xl bg-[#ffdad6] text-[#410002] text-sm text-center"
              role="alert"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Email / Employee ID */}
            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-widest text-[#514345] ml-1"
                htmlFor="ess-email"
                style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
              >
                {t('auth.email', { defaultValue: 'Email address' })}
              </label>
              <div className="relative group">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#837375] text-xl transition-colors group-focus-within:text-[#da336b]"
                  aria-hidden="true"
                >
                  person
                </span>
                <input
                  id="ess-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. j.doe@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl outline-none border-b-2 border-transparent focus:border-[#da336b] transition-all text-[#201a1b] placeholder:text-[#837375] font-medium shadow-sm"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="text-xs text-[#ba1a1a] ml-1" role="alert"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-[#514345]"
                  htmlFor="ess-password"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
                >
                  {t('auth.password', { defaultValue: 'Password' })}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#da336b] hover:opacity-80 transition-opacity tracking-wide"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
                >
                  {t('auth.forgotPassword', { defaultValue: 'Forgot Password?' })}
                </Link>
              </div>
              <div className="relative group">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#837375] text-xl transition-colors group-focus-within:text-[#da336b]"
                  aria-hidden="true"
                >
                  lock
                </span>
                <input
                  id="ess-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="w-full pl-12 pr-12 py-4 bg-white rounded-xl outline-none border-b-2 border-transparent focus:border-[#da336b] transition-all text-[#201a1b] placeholder:text-[#837375] font-medium shadow-sm"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#837375] hover:text-[#da336b] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={showPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-xs text-[#ba1a1a] ml-1" role="alert"
                  style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-4">
              {/* Primary CTA — Magenta gradient */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)',
                  fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)',
                }}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                ) : (
                  <>
                    {t('auth.signIn', { defaultValue: 'Sign In' })}
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Biometric tonal button */}
              <button
                type="button"
                onClick={() => console.warn('Biometric not yet implemented')}
                className="w-full py-4 rounded-2xl bg-[#f2dee1] text-[#da336b] font-bold text-sm uppercase tracking-widest hover:bg-[#ffdae2] transition-all flex items-center justify-center gap-3 active:scale-[0.98] min-h-[44px]"
                style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
                aria-label={t('auth.biometricLogin', { defaultValue: 'Use Biometric Login' })}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  face
                </span>
                {t('auth.biometricLogin', { defaultValue: 'Use Biometric Login' })}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-8 border-t border-[#f2dee1]">
            <div className="flex flex-col gap-4 items-center">
              <p
                className="text-[#514345] text-sm font-medium"
                style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
              >
                {t('auth.newToTeam', { defaultValue: 'New to the team?' })}
              </p>
              <a
                href="#"
                className="text-[#da336b] font-bold text-sm tracking-wide uppercase border-b-2 border-[#da336b]/20 hover:border-[#da336b] transition-all"
                style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
              >
                {t('auth.requestAccessLink', { defaultValue: 'Request Access Link' })}
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default MobileLoginPage;
