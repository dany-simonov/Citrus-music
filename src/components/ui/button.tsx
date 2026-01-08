/**
 * Компонент кнопки
 * @module components/ui/button
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  icon: 'btn-icon',
};

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = variant === 'icon';

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          !isIconOnly && sizeClasses[size],
          'inline-flex items-center justify-center gap-2',
          isLoading && 'opacity-70 cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
