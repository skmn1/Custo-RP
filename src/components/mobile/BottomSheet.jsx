/**
 * BottomSheet — Task 63 (C.2)
 *
 * Modal surface that slides up from screen bottom.
 * Features: swipe-to-dismiss, backdrop tap, Escape key, focus trap.
 * Respects prefers-reduced-motion.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BottomSheet = ({ isOpen, onClose, title, children, snapPoints = ['50%', '90%'] }) => {
  const { t } = useTranslation('ess');
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const dragStartY = useRef(null);
  const [closing, setClosing] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(0);
  const titleId = `bottom-sheet-title-${title?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  // Close with exit animation
  const handleClose = useCallback(() => {
    setClosing(true);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onClose();
      setClosing(false);
    } else {
      setTimeout(() => {
        onClose();
        setClosing(false);
      }, 250);
    }
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    const sheet = sheetRef.current;
    const focusable = sheet.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    sheet.addEventListener('keydown', trap);
    return () => sheet.removeEventListener('keydown', trap);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Drag-to-dismiss handlers
  const handlePointerDown = (e) => {
    dragStartY.current = e.clientY;
  };

  const handlePointerMove = (e) => {
    if (dragStartY.current === null || !sheetRef.current) return;
    const dy = e.clientY - dragStartY.current;
    if (dy > 0) {
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  };

  const handlePointerUp = (e) => {
    if (dragStartY.current === null || !sheetRef.current) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    sheetRef.current.style.transform = '';
    // Dismiss if dragged > 100px or velocity threshold
    if (dy > 100) {
      handleClose();
    }
  };

  if (!isOpen && !closing) return null;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute bottom-0 left-0 right-0 bg-[var(--mobile-bg-elevated)] rounded-t-2xl pb-safe ${
          closing ? 'animate-sheet-exit' : 'animate-sheet-enter'
        }`}
        style={{ maxHeight: snapPoints[currentSnap] || '50%' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div
            className="w-9 h-[5px] rounded-full bg-gray-300"
            aria-label={t('mobile.sheet.dragHint')}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--mobile-separator)]">
          <h2 id={titleId} className="text-mobile-headline text-[var(--mobile-label-primary)]">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="touch-target rounded-full text-[var(--mobile-label-secondary)] hover:text-[var(--mobile-label-primary)] transition-colors"
            aria-label={t('mobile.close')}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
