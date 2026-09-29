import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubText?: boolean;
}

/**
 * Floral Accent SVG Icon for letters
 */
const FlowerAccent: React.FC<{ className?: string }> = ({ className = 'w-2 h-2' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`inline-block ${className}`} aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="19" cy="12" r="2.5" />
    <circle cx="12" cy="19" r="2.5" />
    <circle cx="5" cy="12" r="2.5" />
    <circle cx="17" cy="7" r="2" />
    <circle cx="17" cy="17" r="2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="7" cy="7" r="2" />
  </svg>
);

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

  const flowerSizes = {
    sm: 'w-1.5 h-1.5 -mt-1',
    md: 'w-2 h-2 -mt-1.5',
    lg: 'w-3 h-3 -mt-2.5',
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

      {/* ── Center Boxed Title with Flower Accents ────────────────────────── */}
      <div className="flex flex-col items-center">
        <div className="relative border-2 border-current rounded-xl px-2.5 py-0.5 sm:px-3.5 sm:py-1 flex flex-col items-center justify-center bg-transparent">
          {/* Brand Title with Ornate Floral Accents */}
          <div className="flex items-center font-serif font-bold tracking-wide leading-none text-current">
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              R
            </span>
            <span className="relative inline-flex items-center">
              <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                a
              </span>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current opacity-80">
                <FlowerAccent className={flowerSizes[size]} />
              </span>
            </span>
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              j
            </span>
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              k
            </span>
            <span className="relative inline-flex items-center">
              <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                a
              </span>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current opacity-80">
                <FlowerAccent className={flowerSizes[size]} />
              </span>
            </span>
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              n
            </span>
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              w
            </span>
            <span className="relative inline-flex items-center">
              <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                a
              </span>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-current opacity-80">
                <FlowerAccent className={flowerSizes[size]} />
              </span>
            </span>
            <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              r
            </span>
            <span className="relative inline-flex items-center">
              <span className={titleSizes[size]} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                i
              </span>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-current">
                <FlowerAccent className={flowerSizes[size]} />
              </span>
            </span>
          </div>

          {/* Sub-tagline */}
          <span
            className={`font-semibold uppercase text-current border-t border-current/80 pt-0.5 mt-0.5 w-full text-center leading-tight ${taglineSizes[size]}`}
          >
            House of Ethnic Wear
          </span>
        </div>
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
