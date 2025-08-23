// utils/index.ts

// Экспорты из других модулей utils
export * from './formatters';
export * from './constants';

// Импорты для локальных функций
import { AppMode } from '../types';
import { MODE_CONFIGS } from './constants';

// ==== MODE UTILITIES ====

/**
 * Получает цветовую схему для режима
 */
export const getModeColor = (mode: AppMode) => {
  return MODE_CONFIGS[mode].color;
};

/**
 * Получает иконку для режима
 */
export const getModeIcon = (mode: AppMode) => {
  const icons = {
    focus: 'Flame',
    relax: 'Leaf', 
    planning: 'ClipboardList'
  };
  return icons[mode];
};

// ==== VALIDATION UTILITIES ====

/**
 * Проверяет валидность времени
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Проверяет, что время окончания после времени начала
 */
export const isEndAfterStart = (start: string, end: string): boolean => {
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;
  
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);
  
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  return endTotal > startTotal;
};

// ==== DATE UTILITIES ====

/**
 * Получает начало недели для даты
 */
export const getWeekStart = (date: Date, weekStartsOn: 0 | 1 = 1): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Получает конец недели для даты
 */
export const getWeekEnd = (date: Date, weekStartsOn: 0 | 1 = 1): Date => {
  const weekStart = getWeekStart(date, weekStartsOn);
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Получает массив дней для недели
 */
export const getWeekDays = (date: Date, weekStartsOn: 0 | 1 = 1): Date[] => {
  const weekStart = getWeekStart(date, weekStartsOn);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return days;
};

/**
 * Получает массив дней для месяца
 */
export const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

// ==== STRING UTILITIES ====

/**
 * Создает уникальный ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Безопасное сравнение строк (case-insensitive)
 */
export const safeStringCompare = (a: string = '', b: string = ''): number => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
};

/**
 * Извлекает инициалы из имени
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// ==== ARRAY UTILITIES ====

/**
 * Группирует массив по функции
 */
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

/**
 * Сортирует массив по нескольким ключам
 */
export const sortBy = <T>(
  array: T[],
  ...compareFns: ((a: T, b: T) => number)[]
): T[] => {
  return [...array].sort((a, b) => {
    for (const compareFn of compareFns) {
      const result = compareFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
};

// ==== PERFORMANCE UTILITIES ====

/**
 * Debounce функция
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle функция
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// ==== STORAGE UTILITIES ====

/**
 * Безопасное чтение из localStorage
 */
export const safeLocalStorageGet = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Безопасная запись в localStorage
 */
export const safeLocalStorageSet = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

// ==== COLOR UTILITIES ====

/**
 * Конвертирует hex цвет в RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Получает контрастный цвет (черный или белый) для фона
 */
export const getContrastColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#ffffff';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// ==== ERROR HANDLING ====

/**
 * Создает стандартную ошибку приложения
 */
export const createAppError = (message: string, code?: string): Error => {
  const error = new Error(message);
  (error as any).code = code;
  return error;
};

/**
 * Безопасное выполнение async функции
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.warn('Safe async execution failed:', error);
    return fallback;
  }
};

// ==== EXPORT COLLECTIONS ====

export const VIEW_CONFIGS = {
  calendar: { title: 'Календарь', description: 'Месячное представление' },
  schedule: { title: 'Расписание', description: 'Список событий' },
  week: { title: 'Неделя', description: 'Недельное представление' },
  day: { title: 'День', description: 'Детальный вид дня' },
  agenda: { title: 'Агенда', description: 'Компактный список' },
  library: { title: 'Библиотека', description: 'Сохраненные шаблоны' },
  analytics: { title: 'Аналитика', description: 'Статистика и отчеты' },
  profile: { title: 'Профиль', description: 'Настройки приложения' },
  roadmap: { title: 'Роадмап', description: 'План развития' }
} as const;

export const MODE_ICONS = {
  focus: 'Flame',
  relax: 'Leaf',
  planning: 'ClipboardList'
} as const;

export const KEYBOARD_SHORTCUTS = {
  newEvent: 'KeyN',
  today: 'KeyT', 
  focusMode: 'KeyQ',
  relaxMode: 'KeyW',
  planningMode: 'KeyE',
  nextPeriod: 'ArrowRight',
  prevPeriod: 'ArrowLeft'
} as const;