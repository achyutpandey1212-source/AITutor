import React, { useState, useRef, useEffect } from 'react';
import type { ModelTier } from './types';
import { MODEL_TIER_OPTIONS } from './types';

interface ModelSelectorProps {
  selectedTier: ModelTier;
  onSelectTier: (tier: ModelTier) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedTier,
  onSelectTier,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    MODEL_TIER_OPTIONS.find((opt) => opt.id === selectedTier) ||
    MODEL_TIER_OPTIONS[1]; // default Lumo Light

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all var(--motion-fast) var(--ease-standard)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color:
              currentOption.id === 'pro'
                ? 'var(--color-orange)'
                : currentOption.id === 'fast'
                ? 'var(--color-yellow)'
                : 'var(--color-sky)',
          }}
        >
          {currentOption.badge}
        </span>
        <span>{currentOption.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 110,
            width: '280px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'lumo-slide-up var(--motion-fast) var(--ease-enter)',
          }}
        >
          <div
            style={{
              padding: '6px 10px 4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Model Intelligence
          </div>

          {MODEL_TIER_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedTier;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectTier(opt.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isSelected ? 'var(--color-surface-hover)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background var(--motion-fast) var(--ease-standard)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    lineHeight: '20px',
                    color:
                      opt.id === 'pro'
                        ? 'var(--color-orange)'
                        : opt.id === 'fast'
                        ? 'var(--color-yellow)'
                        : 'var(--color-sky)',
                  }}
                >
                  {opt.badge}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          color: 'var(--color-orange)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.35,
                    }}
                  >
                    {opt.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
