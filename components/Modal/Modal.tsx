'use client';

import React, { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import css from './Modal.module.css';

type ModalProps = {
  children: React.ReactNode;
  onClose?: () => void;
  ariaLabel?: string;
  labelledBy?: string;
};

export default function Modal({ children, onClose, ariaLabel, labelledBy }: ModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef(false);
  const autoLabelId = useId();

  const close = useCallback(() => {
    if (typeof onClose === 'function') onClose();
    else router.back();
  }, [onClose, router]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    lastActiveElRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const toFocus = contentRef.current || closeBtnRef.current;
    setTimeout(() => {
      (toFocus as HTMLElement | null)?.focus?.();
    }, 0);

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };

    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const root = contentRef.current;
      const focusable = root?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable || focusable.length === 0) {
        e.preventDefault();
        root?.focus?.();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onEsc);
    window.addEventListener('keydown', onTrap, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('keydown', onTrap, true);
      lastActiveElRef.current?.focus?.();
    };
  }, [close]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const overlay = (
    <div
      ref={overlayRef}
      className={css.overlay}
      onClick={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy || (ariaLabel ? undefined : autoLabelId)}
      aria-label={ariaLabel}
    >
      <div
        className={css.content}
        ref={contentRef}
        tabIndex={-1}
      >
        <button
          ref={closeBtnRef}
          className={css.close}
          aria-label="Close modal"
          onClick={close}
          type="button"
        >
          ×
        </button>

        {!labelledBy && !ariaLabel && (
          <span id={autoLabelId} style={{ position: 'absolute', inset: '-9999px' }}>
            Modal dialog
          </span>
        )}

        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
