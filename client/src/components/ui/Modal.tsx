import React, { useEffect, useRef } from 'react';

// ---------------------------------------------------------------
// Lumo Modal Component
// Accessible, keyboard-friendly, animated modal dialog
// ---------------------------------------------------------------

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: string | number;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = '540px',
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const titleId = title ? 'lumo-modal-title' : undefined;
  const descId = description ? 'lumo-modal-desc' : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-overlay)',
          animation: 'lumo-fade-in var(--motion-standard) var(--ease-enter) both',
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={dialogRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--space-6)',
          animation: 'lumo-scale-in var(--motion-standard) var(--ease-enter) both',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            {title && (
              <h2
                id={titleId}
                style={{
                  fontSize: 'var(--text-h3)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descId}
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)',
                  marginBlockEnd: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-soft)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
