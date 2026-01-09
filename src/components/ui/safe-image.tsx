/**
 * Компонент безопасного изображения с fallback
 * @module components/ui/safe-image
 */

'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ListMusic, User, Disc3 } from 'lucide-react';

type FallbackType = 'track' | 'playlist' | 'artist' | 'none';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackType?: FallbackType;
  fallbackClassName?: string;
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackType = 'track',
  fallbackClassName,
  className,
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем, что src валидный URL
  const isValidSrc = src && typeof src === 'string' && (src.startsWith('http') || src.startsWith('/'));

  if (!isValidSrc || hasError) {
    return (
      <div className={cn(
        'w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800',
        fallbackClassName
      )}>
        {fallbackType === 'track' && <ListMusic className="w-1/3 h-1/3 text-gray-400" />}
        {fallbackType === 'playlist' && <Disc3 className="w-1/3 h-1/3 text-gray-400" />}
        {fallbackType === 'artist' && <User className="w-1/3 h-1/3 text-gray-400" />}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 dark:bg-neutral-800 animate-pulse',
          fallbackClassName
        )} />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(className, isLoading && 'opacity-0')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </>
  );
}
