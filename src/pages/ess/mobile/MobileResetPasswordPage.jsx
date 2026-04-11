/**
 * MobileResetPasswordPage — Task 79 (SCREEN_129)
 *
 * Full-screen password reset view styled with the Nexus Kinetic design system.
 * Standalone route — no <MobileShell> wrapper, no bottom nav.
 * Glass-card layout with ambient orb background.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordApi } from '../../../api/authApi';

export const MobileResetPasswordPage = () => {
  const { t } = useTranslation('ess');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return t('auth.validation.emailRequired', { defaultValue: 'Email is required.' });
    if (!emailRegex.test(value)) return t('auth.validation.emailInvalid', { defaultValue: 'Enter a valid email address.' });
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await forgotPasswordApi(email);
      setSuccess(true);
    } catch (err) {
      if (err.status === 503) {
        setError(t('auth.error.unavailable', { defaultValue: 'Service unavailable. Please try again later.' }));
      } else {
        // Always show success-like message to prevent email enumeration
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#fffbff] text-[#201a1b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'rgba(218, 51, 107, 0.20)', filter: 'blur(120px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(155, 63, 88, 0.10)', filter: 'blur(120px)' }}
        aria-hidden="true"
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#514345] hover:text-[#da336b] transition-colors font-semibold min-h-[44px] px-2"
        style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
        aria-label={t('auth.backToLogin', { defaultValue: 'Back to Login' })}
      >
        <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
        <span className="text-sm">{t('auth.backToLogin', { defaultValue: 'Back to Login' })}</span>
      </button>

      {/* Glass card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl border"
        style={{
          background: 'rgba(255, 255, 255, 0.70)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(213, 194, 197, 0.20)',
        }}
      >
        {/* Icon badge */}
        <div
          className="w-16 h-16 mb-6 rounded-2xl bg-[#da336b] flex items-center justify-center"
          style={{ boxShadow: '0 8px 24px rgba(218, 51, 107, 0.30)' }}
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined text-white text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock_reset
          </span>
        </div>

        <h1
          className="text-2xl font-bold tracking-tight text-[#201a1b] mb-2"
          style={{ fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)' }}
        >
          {t('auth.resetTitle', { defaultValue: 'Reset Password' })}
        </h1>
        <p
          className="text-[#514345] text-sm mb-8 leading-relaxed"
          style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
        >
          {t('auth.resetDescription', { defaultValue: "No worries! Enter the email linked to your account and we'll send you a reset link." })}
        </p>

        {/* Global error */}
        {error && (
          <div
            className="mb-6 p-3 rounded-xl bg-[#ffdad6] text-[#410002] text-sm text-center"
            role="alert"
            style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
          >
            {error}
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div
            className="mb-6 p-4 rounded-xl text-sm text-center font-semibold"
            role="status"
            style={{
              background: 'rgba(255, 218, 226, 0.40)',
              color: '#da336b',
              fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)',
            }}
          >
            <span
              className="material-symbols-outlined text-base align-middle mr-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              check_circle
            </span>
            {t('auth.resetSuccess', { defaultValue: 'Reset link sent! Please check your inbox.' })}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="relative group">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#837375] text-xl transition-colors group-focus-within:text-[#da336b]"
              aria-hidden="true"
            >
              mail
            </span>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'reset-email-error' : undefined}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl outline-none border-b-2 border-transparent focus:border-[#da336b] transition-all text-[#201a1b] placeholder:text-[#837375] font-medium shadow-sm"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            />
          </div>
          {emailError && (
            <p
              id="reset-email-error"
              className="text-xs text-[#ba1a1a] ml-1"
              role="alert"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {emailError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 min-h-[44px]"
            style={{
              background: 'linear-gradient(135deg, #da336b 0%, #8b2044 100%)',
              fontFamily: 'var(--mobile-font-headline, "Plus Jakarta Sans", sans-serif)',
            }}
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl" aria-hidden="true">send</span>
                {t('auth.sendResetLink', { defaultValue: 'Send Reset Link' })}
              </>
            )}
          </button>
        </form>

        {/* Help tiles */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div
            className="border p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.40)', borderColor: 'rgba(218, 51, 107, 0.10)' }}
          >
            <span
              className="material-symbols-outlined text-[#da336b] text-2xl mb-2 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              verified_user
            </span>
            <p
              className="font-bold text-[#201a1b] text-xs mb-1"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t('auth.securityTitle', { defaultValue: 'Account Security' })}
            </p>
            <p
              className="text-[#514345] text-[11px] leading-relaxed"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t('auth.securityDescription', { defaultValue: 'Links expire in 30 minutes for your protection.' })}
            </p>
          </div>
          <div
            className="border p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.40)', borderColor: 'rgba(218, 51, 107, 0.10)' }}
          >
            <span
              className="material-symbols-outlined text-[#da336b] text-2xl mb-2 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              support_agent
            </span>
            <p
              className="font-bold text-[#201a1b] text-xs mb-1"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t('auth.supportTitle', { defaultValue: 'Need Help?' })}
            </p>
            <p
              className="text-[#514345] text-[11px] leading-relaxed"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t('auth.supportDescription', { defaultValue: 'Contact IT support for account recovery.' })}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile quick-action bar */}
      <div
        className="fixed bottom-0 inset-x-0 md:hidden px-6 pb-8 pt-4 flex justify-center gap-6"
        style={{ background: 'linear-gradient(to top, #fffbff, transparent)' }}
      >
        {[
          { icon: 'phone', label: 'auth.callUs', defaultLabel: 'Call Us' },
          { icon: 'chat', label: 'auth.chat', defaultLabel: 'Chat' },
          { icon: 'help', label: 'auth.faq', defaultLabel: 'FAQ' },
        ].map(({ icon, label, defaultLabel }) => (
          <button
            key={icon}
            type="button"
            className="flex flex-col items-center gap-1 text-[#514345] hover:text-[#da336b] transition-colors min-h-[44px] min-w-[44px] justify-center"
            aria-label={t(label, { defaultValue: defaultLabel })}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{icon}</span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: 'var(--mobile-font-body, Manrope, sans-serif)' }}
            >
              {t(label, { defaultValue: defaultLabel })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileResetPasswordPage;
