// utils/constants.ts

// ==== TIMING CONSTANTS ====
export const AUTO_REMOVE_DELAY = 8000; // 8 секунд для автоудаления уведомлений (увеличено с 5 сек)
export const NOTIFICATION_SOUND_DURATION = 500;
export const ANIMATION_DURATION = 300;

// ==== UI CONSTANTS ====
export const MAX_NOTIFICATIONS = 10;
export const DEFAULT_CALENDAR_WEEKS = 6;
export const MIN_EVENT_DURATION = 15; // минимум 15 минут
export const MAX_EVENT_TITLE_LENGTH = 100;
export const MAX_EVENT_DESCRIPTION_LENGTH = 500;

// ==== KEYBOARD SHORTCUTS ====
export const KEYBOARD_SHORTCUTS = {
  newEvent: 'KeyN',
  today: 'KeyT',
  focusMode: 'KeyQ',
  relaxMode: 'KeyW', 
  planningMode: 'KeyE',
  nextPeriod: 'ArrowRight',
  prevPeriod: 'ArrowLeft',
  search: 'KeyF',
  escape: 'Escape'
} as const;

// ==== VIEW CONFIGURATIONS ====
export const VIEW_CONFIGS = {
  calendar: {
    title: 'Календарь',
    description: 'Месячное представление событий',
    icon: 'Calendar',
    shortcut: '1'
  },
  schedule: {
    title: 'Расписание', 
    description: 'Список событий по дням',
    icon: 'List',
    shortcut: '2'
  },
  week: {
    title: 'Неделя',
    description: 'Недельное представление',
    icon: 'BarChart3',
    shortcut: '3'
  },
  day: {
    title: 'День',
    description: 'Детальный вид дня',
    icon: 'Calendar',
    shortcut: '4'
  },
  agenda: {
    title: 'Агенда',
    description: 'Компактный список',
    icon: 'List',
    shortcut: '5'
  },
  library: {
    title: 'Библиотека',
    description: 'Сохраненные шаблоны',
    icon: 'BookOpen',
    shortcut: '6'
  },
  analytics: {
    title: 'Аналитика',
    description: 'Статистика и отчеты',
    icon: 'BarChart3',
    shortcut: '7'
  },
  profile: {
    title: 'Профиль',
    description: 'Настройки приложения',
    icon: 'User',
    shortcut: '8'
  },
  roadmap: {
    title: 'Роадмап',
    description: 'План развития',
    icon: 'Map',
    shortcut: '9'
  }
} as const;

// ==== MODE CONFIGURATIONS ====
export const MODE_CONFIGS = {
  focus: {
    title: 'Фокус',
    description: 'Концентрация на важных задачах',
    color: {
      bg: 'bg-red-600',
      text: 'text-red-400',
      border: 'border-red-500'
    },
    features: ['Минимальные уведомления', 'Скрытие второстепенных элементов', 'Таймер Pomodoro']
  },
  relax: {
    title: 'Отдых',
    description: 'Спокойный режим работы',
    color: {
      bg: 'bg-green-600',
      text: 'text-green-400', 
      border: 'border-green-500'
    },
    features: ['Приглушенные цвета', 'Мягкие уведомления', 'Музыкальное сопровождение']
  },
  planning: {
    title: 'Планирование',
    description: 'Организация и структурирование',
    color: {
      bg: 'bg-blue-600',
      text: 'text-blue-400',
      border: 'border-blue-500'
    },
    features: ['Полная функциональность', 'Аналитика', 'Drag & Drop']
  }
} as const;

// ==== EVENT TYPE CONFIGURATIONS ====
export const EVENT_TYPE_CONFIGS = {
  practice: {
    label: 'Практика',
    color: 'bg-purple-900/30 text-purple-400 border-purple-700',
    icon: '🎹',
    priority: 'high'
  },
  concert: {
    label: 'Концерт',
    color: 'bg-red-900/30 text-red-400 border-red-700',
    icon: '🎭',
    priority: 'high'
  },
  lesson: {
    label: 'Урок',
    color: 'bg-blue-900/30 text-blue-400 border-blue-700',
    icon: '📚',
    priority: 'medium'
  },
  travel: {
    label: 'Поездка',
    color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
    icon: '✈️',
    priority: 'medium'
  },
  meal: {
    label: 'Еда',
    color: 'bg-green-900/30 text-green-400 border-green-700',
    icon: '🍽️',
    priority: 'low'
  },
  break: {
    label: 'Перерыв',
    color: 'bg-gray-900/30 text-gray-400 border-gray-700',
    icon: '☕',
    priority: 'low'
  },
  personal: {
    label: 'Личное',
    color: 'bg-pink-900/30 text-pink-400 border-pink-700',
    icon: '👤',
    priority: 'medium'
  },
  free: {
    label: 'Свободное время',
    color: 'bg-indigo-900/30 text-indigo-400 border-indigo-700',
    icon: '🎯',
    priority: 'low'
  }
} as const;

// ==== PRIORITY CONFIGURATIONS ====
export const PRIORITY_CONFIGS = {
  low: {
    label: 'Низкий',
    color: 'text-gray-400',
    icon: '⬇️',
    weight: 1
  },
  medium: {
    label: 'Средний',
    color: 'text-yellow-400',
    icon: '➡️',
    weight: 2
  },
  high: {
    label: 'Высокий',
    color: 'text-red-400',
    icon: '⬆️',
    weight: 3
  }
} as const;

// ==== TIME FORMATS ====
export const TIME_FORMATS = {
  '12h': {
    format: 'h:mm a',
    example: '2:30 PM'
  },
  '24h': {
    format: 'HH:mm',
    example: '14:30'
  }
} as const;

// ==== DATE FORMATS ====
export const DATE_FORMATS = {
  short: 'dd.MM.yy',
  medium: 'dd MMM yyyy',
  long: 'EEEE, dd MMMM yyyy',
  iso: 'yyyy-MM-dd'
} as const;

// ==== API ENDPOINTS (для будущего использования) ====
export const API_ENDPOINTS = {
  auth: '/api/auth',
  events: '/api/events',
  analytics: '/api/analytics',
  settings: '/api/settings',
  backup: '/api/backup'
} as const;

// ==== STORAGE KEYS ====
export const STORAGE_KEYS = {
  timeBlocks: 'organizer_time_blocks',
  settings: 'organizer_settings',
  notifications: 'organizer_notifications',
  lastSync: 'organizer_last_sync'
} as const;

// ==== ERROR MESSAGES ====
export const ERROR_MESSAGES = {
  networkError: 'Ошибка сети. Проверьте подключение к интернету.',
  validationError: 'Проверьте правильность введенных данных.',
  saveError: 'Не удалось сохранить изменения.',
  loadError: 'Не удалось загрузить данные.',
  genericError: 'Произошла неизвестная ошибка.'
} as const;

// ==== SUCCESS MESSAGES ====
export const SUCCESS_MESSAGES = {
  eventCreated: 'Событие успешно создано',
  eventUpdated: 'Событие обновлено',
  eventDeleted: 'Событие удалено',
  settingsSaved: 'Настройки сохранены',
  dataBackup: 'Данные сохранены в резервную копию'
} as const;

// ==== REGEX PATTERNS ====
export const PATTERNS = {
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/
} as const;