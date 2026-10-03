import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const logoHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/rajkanwari_logo.jpeg"
        alt="Rajkanwari — House of Ethnic Wear"
        className={`${logoHeights[size]} w-auto object-contain mix-blend-multiply dark:invert dark:brightness-150`}
      />
    </div>
  );
};
