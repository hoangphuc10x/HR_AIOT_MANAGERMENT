import React from 'react';
import Image from 'next/image';
import { cn } from '../../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <Image
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={alt || 'Avatar'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium">
            {fallback || 'U'}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

export { Avatar };
