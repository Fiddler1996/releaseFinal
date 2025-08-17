// components/ui/LoadingSpinner.tsx
import React from 'react';
import type { LoadingSpinnerProps } from '../../types';

/**
 * Компонент индикатора загрузки
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  progress
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Спиннер */}
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin`}
        />
        
        {/* Прогресс (если есть) */}
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-medium text-blue-400 ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 'text-base'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Текст загрузки */}
      {text && (
        <div className={`text-gray-300 text-center ${textSizes[size]}`}>
          {text}
        </div>
      )}

      {/* Прогресс бар (если есть прогресс) */}
      {progress !== undefined && (
        <div className="w-48 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};