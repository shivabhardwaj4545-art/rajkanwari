import React, { useState } from 'react';

const DEFAULT_ETHNIC_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null | undefined;
  fallbackSrc?: string | null | undefined;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt = 'Product image',
  className = '',
  ...props
}) => {
  const resolvedFallback: string = fallbackSrc || DEFAULT_ETHNIC_IMAGE_FALLBACK;
  const initialSrc: string = (src || resolvedFallback) as string;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
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
