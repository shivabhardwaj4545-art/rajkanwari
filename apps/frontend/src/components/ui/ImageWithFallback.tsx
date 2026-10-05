import React, { useEffect, useState } from 'react';

export const DEFAULT_PRODUCT_PLACEHOLDER = '/placeholder.svg';

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null | undefined;
  fallbackSrc?: string | null | undefined;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_PRODUCT_PLACEHOLDER,
  alt = 'Product image',
  className = '',
  ...props
}) => {
  const resolvedFallback = fallbackSrc || DEFAULT_PRODUCT_PLACEHOLDER;
  const initialSrc = (src && src.trim()) ? src : resolvedFallback;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nextSrc = (src && src.trim()) ? src : resolvedFallback;
    setImgSrc(nextSrc);
    setHasError(false);
  }, [src, resolvedFallback]);

  const handleError = () => {
    if (!hasError && imgSrc !== resolvedFallback) {
      setHasError(true);
      setImgSrc(resolvedFallback);
    }
  };

  return (
    <img
      src={imgSrc || resolvedFallback}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

