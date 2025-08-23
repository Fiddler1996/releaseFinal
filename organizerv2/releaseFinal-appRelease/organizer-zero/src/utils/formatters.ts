// utils/formatters.ts
import type { TimeBlockType, Priority } from '../types';

// ==== TIME FORMATTING ====

/**
 * Форматирует время в зависимости от формата (12h/24h)
 */
export const formatTime = (time: string, format: '12h' | '24h' = '24h'): string => {
  if (!time || !time.includes(':')) return time;
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error formatting time:', time, error);
    return time;
  }
};

/**
 * Форматирует временной диапазон
 */
export const formatTimeRange = (start: string, end: string, format: '12h' | '24h' = '24h'): string => {
  return `${formatTime(start, format)} - ${formatTime(end, format)}`;
};

/**
 * Вычисляет и форматирует продолжительность
 */
export const formatDuration = (start: string, end: string): string => {
  try {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = Math.max(0, endTotalMinutes - startTotalMinutes);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} мин`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} ${getHourWord(hours)}`;
    }
    
    return `${hours}${getHourWord(hours)} ${minutes} мин`;
  } catch (error) {
    console.warn('Error calculating duration:', start, end, error);
    return '0 мин';
  }
};

/**
 * Помощник для склонения слова "час"
 */
const getHourWord = (hours: number): string => {
  const lastDigit = hours % 10;
  const lastTwoDigits = hours % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return ' часов';
  if (lastDigit === 1) return ' час';
  if (lastDigit >= 2 && lastDigit <= 4) return ' часа';
  return ' часов';
};

// ==== DATE FORMATTING ====

/**
 * Форматирует дату в различных форматах
 */
export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return typeof date === 'string' ? date : '';
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const daysDiff = Math.floor((inputDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (format === 'relative') {
      if (daysDiff === 0) return 'Сегодня';
      if (daysDiff === 1) return 'Завтра';
      if (daysDiff === -1) return 'Вчера';
      if (daysDiff > 1 && daysDiff <= 7) return `Через ${daysDiff} ${getDayWord(daysDiff)}`;
      if (daysDiff < -1 && daysDiff >= -7) return `${Math.abs(daysDiff)} ${getDayWord(Math.abs(daysDiff))} назад`;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: format === 'short' ? 'numeric' : 'long',
      year: format === 'short' ? '2-digit' : 'numeric',
      weekday: format === 'long' ? 'long' : undefined
    };
    
    return dateObj.toLocaleDateString('ru-RU', options);
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Помощник для склонения слова "день"
 */
const getDayWord = (days: number): string => {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
};

/**
 * Форматирует дату для input[type="date"]
 */
export const formatDateForInput = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error formatting date for input:', date, error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Проверяет, является ли дата сегодняшней
 */
export const isToday = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
};

/**
 * Проверяет, является ли дата завтрашней
 */
export const isTomorrow = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return dateObj.getDate() === tomorrow.getDate() &&
           dateObj.getMonth() === tomorrow.getMonth() &&
           dateObj.getFullYear() === tomorrow.getFullYear();
  } catch (error) {
    return false;
  }
};

/**
 * Проверяет, является ли дата вчерашней
 */
export const isYesterday = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dateObj.getDate() === yesterday.getDate() &&
           dateObj.getMonth() === yesterday.getMonth() &&
           dateObj.getFullYear() === yesterday.getFullYear();
  } catch (error) {
    return false;
  }
};

// ==== TEXT FORMATTING ====

/**
 * Обрезает текст до указанной длины с многоточием
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Капитализирует первую букву строки
 */
export const capitalize = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Форматирует тип события для отображения
 */
export const formatEventType = (type: TimeBlockType): string => {
  const typeLabels: Record<TimeBlockType, string> = {
    practice: 'Практика',
    concert: 'Концерт',
    lesson: 'Урок',
    travel: 'Поездка',
    meal: 'Еда',
    break: 'Перерыв',
    personal: 'Личное',
    free: 'Свободное время'
  };
  
  return typeLabels[type] || capitalize(type);
};

/**
 * Форматирует приоритет для отображения
 */
export const formatPriority = (priority: Priority): string => {
  const priorityLabels: Record<Priority, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };
  
  return priorityLabels[priority] || capitalize(priority);
};

// ==== NUMBER FORMATTING ====

/**
 * Форматирует число с разделителями тысяч
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

/**
 * Форматирует процент
 */
export const formatPercent = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percent = Math.round((value / total) * 100);
  return `${percent}%`;
};

// ==== VALIDATION HELPERS ====

/**
 * Проверяет валидность времени в формате HH:MM
 */
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Проверяет валидность даты
 */
export const isValidDate = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Проверяет, что время окончания после времени начала
 */
export const isEndTimeAfterStart = (startTime: string, endTime: string): boolean => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) return false;
  
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes > startTotalMinutes;
  } catch (error) {
    return false;
  }
};