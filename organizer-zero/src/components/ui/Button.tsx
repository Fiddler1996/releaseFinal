// components/ui/Button.tsx
import React from 'react';
import type { ButtonProps } from '../../types';

/**
 * Компонент кнопки с поддержкой иконок и состояний загрузки
 */
export const Button: React.FC<ButtonProps> = ({
  children = null,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  loading = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <>
          <div className={`animate-spin rounded-full border-2 border-transparent border-t-current ${iconSizes[size]} mr-2`} />
          {children}
        </>
      ) : (
        <>
          {Icon && (
            <Icon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
          )}
          {children}
        </>
      )}
    </button>
  );
};