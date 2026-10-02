import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-16 sm:h-16',
  };

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-4xl',
  };

  const taglineSizes = {
    sm: 'text-[7px] sm:text-[9px] tracking-[0.18em]',
    md: 'text-[8px] sm:text-[10px] tracking-[0.22em]',
    lg: 'text-[10px] sm:text-[12px] tracking-[0.25em]',
  };

  const rightTextSizes = {
    sm: 'text-[6px] sm:text-[8px] tracking-wider',
    md: 'text-[7px] sm:text-[9px] tracking-widest',
    lg: 'text-[9px] sm:text-[11px] tracking-widest',
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 select-none text-current ${className}`}>
      {/* ── Left Dress & Hanger Icon ────────────────────────────────────────── */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-current fill-current"
          aria-hidden="true"
        >
          {/* Coat Hanger Hook */}
          <path
            d="M 50 16 C 50 10 56 8 58 12 C 59 15 57 18 50 21 L 50 25 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Hanger Shoulder Frame */}
          <path
            d="M 30 32 Q 50 25 70 32 L 66 36 L 34 36 Z"
            fill="currentColor"
          />
          {/* Dress Straps */}
          <path d="M 38 32 L 40 42 M 62 32 L 60 42" stroke="currentColor" strokeWidth="2.5" />
          {/* Flared Gown Silhouette */}
          <path
            d="M 40 42 C 45 44 55 44 60 42 C 62 52 58 60 68 84 C 54 86 46 86 32 84 C 42 60 38 52 40 42 Z"
            fill="currentColor"
          />
          {/* Waist Band */}
          <path d="M 40 54 C 47 56 53 56 60 54" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* ── Center Brand Title & Sub-tagline ────────────────────────── */}
      <div className="flex flex-col items-start justify-center">
        <span
          className={`font-serif font-bold tracking-wide leading-none text-current ${titleSizes[size]}`}
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Rajkanwari
        </span>
        {showSubText && (
          <span
            className={`font-semibold uppercase tracking-[0.2em] text-brand-gold dark:text-brand-gold mt-0.5 leading-tight ${taglineSizes[size]}`}
          >
            House of Ethnic Wear
          </span>
        )}
      </div>

      {/* ── Right Sub-brand Tag (A BRAND OF DHANANYA ATTIRE) ──────────────── */}
      {variant === 'full' && showSubText && (
        <div className="hidden sm:flex flex-col items-start justify-center border-l border-current/30 pl-2.5 ml-0.5 py-0.5 text-current/90 uppercase font-semibold">
          <div className="border-b border-current/40 pb-0.5 mb-0.5 w-full">
            <span className={`block font-medium ${rightTextSizes[size]}`}>A BRAND OF</span>
          </div>
          <span className={`block font-bold leading-tight ${rightTextSizes[size]}`}>
            DHANANYA ATTIRE
          </span>
          <div className="border-t border-current/40 pt-0.5 mt-0.5 w-full" />
        </div>
      )}
    </div>
  );
};
