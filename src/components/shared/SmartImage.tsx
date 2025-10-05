"use client";

import { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function SmartImage({ src, alt, className, fallbackSrc }: SmartImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // اگر thumbnail خطا داد، از تصویر اصلی استفاده کن
      if (src.includes('/_thumbs/')) {
        const originalSrc = src.replace('/_thumbs/', '/').replace('.webp', '.jpg');
        setImageSrc(originalSrc);
      } else if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
