import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubText?: boolean;
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubText = true,
  inverted = false,
}) => {
  const badgeDimensions = {
    sm: 'h-8 w-8 sm:h-9 sm:w-9',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
  };

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const subSizes = {
    sm: 'text-[8px] sm:text-[9px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[10px] sm:text-[11px]',
  };

  const isMinimal = variant === 'minimal' || variant === 'compact';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Brand Crest Emblem */}
      <img
        src="/images/shikkis_logo_square.png"
        alt="Shikki's"
        className={`${badgeDimensions[size]} object-contain rounded-lg ring-1 ring-brand-gold/40 shadow-xs transition-transform duration-200 hover:scale-105 shrink-0 ${
          inverted ? 'brightness-110' : ''
        }`}
      />

      {/* Brand Name Typography Beside Logo */}
      {!isMinimal && (
        <div className="flex flex-col text-left justify-center">
          <span
            className={`font-serif font-bold tracking-normal text-text leading-none ${titleSizes[size]}`}
          >
            Shikki's
          </span>
          {showSubText && (
            <span
              className={`font-sans tracking-widest uppercase text-brand-gold font-semibold leading-none mt-1 ${subSizes[size]}`}
            >
              CURATED STYLE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

