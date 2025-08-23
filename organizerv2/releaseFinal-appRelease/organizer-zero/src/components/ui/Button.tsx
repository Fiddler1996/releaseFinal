// components/ui/Button.tsx
import React, { forwardRef } from 'react';
import { useSettings } from '../../store/settings';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}, ref) => {
  const { getCurrentTheme } = useSettings();
  const isDark = getCurrentTheme() === 'dark';

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: isDark
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: isDark
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 focus:ring-slate-500'
      : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 focus:ring-gray-500',
    ghost: isDark
      ? 'text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-500'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    danger: isDark
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;