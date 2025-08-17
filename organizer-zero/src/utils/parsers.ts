// utils/parsers.ts

/**
 * Нормализует текст для поиска (убирает диакритики, приводит к нижнему регистру)
 */
export const normalizeEventText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Убираем диакритические знаки
    .replace(/[^a-z0-9а-я\s]/gi, ' ') // Заменяем спецсимволы пробелами
    .replace(/\s+/g, ' ') // Убираем множественные пробелы
    .trim();
};

/**
 * Парсит естественный ввод времени в формат HH:MM
 */
export const parseTimeInput = (input: string): string | null => {
  const cleaned = input.replace(/\s/g, '');
  
  // Паттерны для распознавания времени
  const patterns = [
    /^(\d{1,2}):(\d{2})$/, // 14:30
    /^(\d{1,2})\.(\d{2})$/, // 14.30
    /^(\d{1,2}),(\d{2})$/, // 14,30
    /^(\d{1,2})-(\d{2})$/, // 14-30
    /^(\d{3,4})$/, // 1430 или 230
    /^(\d{1,2})$/ // 14
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let hours: number;
      let minutes: number;
      
      if (match.length === 2) {
        // Только часы или сжатый формат
        if (match[1].length >= 3) {
          // Сжатый формат (1430)
          const timeStr = match[1].padStart(4, '0');
          hours = parseInt(timeStr.slice(0, 2));
          minutes = parseInt(timeStr.slice(2, 4));
        } else {
          // Только часы
          hours = parseInt(match[1]);
          minutes = 0;
        }
      } else {
        // Часы и минуты
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      }
      
      // Валидация
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
  }
  
  return null;
};

/**
 * Парсит естественный ввод даты
 */
export const parseDateInput = (input: string): Date | null => {
  const cleaned = input.toLowerCase().trim();
  const today = new Date();
  
  // Относительные даты
  if (cleaned === 'сегодня' || cleaned === 'today') {
    return today;
  }
  
  if (cleaned === 'завтра' || cleaned === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  if (cleaned === 'послезавтра') {
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  }
  
  // Дни недели
  const weekdays = {
    'понедельник': 1, 'пн': 1, 'monday': 1, 'mon': 1,
    'вторник': 2, 'вт': 2, 'tuesday': 2, 'tue': 2,
    'среда': 3, 'ср': 3, 'wednesday': 3, 'wed': 3,
    'четверг': 4, 'чт': 4, 'thursday': 4, 'thu': 4,
    'пятница': 5, 'пт': 5, 'friday': 5, 'fri': 5,
    'суббота': 6, 'сб': 6, 'saturday': 6, 'sat': 6,
    'воскресенье': 0, 'вс': 0, 'sunday': 0, 'sun': 0
  };
  
  const weekday = weekdays[cleaned as keyof typeof weekdays];
  if (weekday !== undefined) {
    const result = new Date(today);
    const daysUntilWeekday = (weekday - today.getDay() + 7) % 7;
    result.setDate(today.getDate() + (daysUntilWeekday || 7));
    return result;
  }
  
  // Числовые форматы дат
  const datePatterns = [
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // 25.12.2024
    /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/, // 25.12.24
    /^(\d{1,2})\.(\d{1,2})$/, // 25.12 (текущий год)
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // 2024-12-25
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // 25-12-2024
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // 25/12/2024
    /^(\d{1,2})\/(\d{1,2})$/ // 25/12
  ];
  
  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      let day: number, month: number, year: number;
      
      if (pattern.source.includes('yyyy') || pattern.source.includes('d{4}')) {
        // Формат с полным годом
        if (pattern.source.startsWith('^(\\d{4})')) {
          // YYYY-MM-DD
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
        } else {
          // DD.MM.YYYY или DD-MM-YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
        }
      } else if (match[3]) {
        // Формат с коротким годом
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        if (year < 50) year += 2000;
        else if (year < 100) year += 1900;
      } else {
        // Без года - используем текущий
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = today.getFullYear();
        
        // Если дата уже прошла в этом году, используем следующий год
        const testDate = new Date(year, month, day);
        if (testDate < today) {
          year++;
        }
      }
      
      const result = new Date(year, month, day);
      if (!isNaN(result.getTime()) && 
          result.getDate() === day && 
          result.getMonth() === month && 
          result.getFullYear() === year) {
        return result;
      }
    }
  }
  
  return null;
};

/**
 * Парсит естественный ввод продолжительности
 */
export const parseDurationInput = (input: string): number | null => {
  const cleaned = input.toLowerCase().replace(/\s/g, '');
  
  // Паттерны для продолжительности
  const patterns = [
    { regex: /^(\d+)ч(\d+)м?$/, hours: 1, minutes: 2 }, // 2ч30м
    { regex: /^(\d+)ч$/, hours: 1, minutes: 0 }, // 2ч
    { regex: /^(\d+)м(ин)?$/, hours: 0, minutes: 1 }, // 30м или 30мин
    { regex: /^(\d+):(\d+)$/, hours: 1, minutes: 2 }, // 2:30
    { regex: /^(\d+)\.(\d+)$/, hours: 1, minutes: 2 }, // 2.5 (как 2ч30м)
    { regex: /^(\d+)$/, hours: 0, minutes: 1 } // 30 (минуты)
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern.regex);
    if (match) {
      let totalMinutes = 0;
      
      if (pattern.hours && match[pattern.hours]) {
        totalMinutes += parseInt(match[pattern.hours]) * 60;
      }
      
      if (pattern.minutes && match[pattern.minutes]) {
        if (pattern.regex.source.includes('\\.')) {
          // Десятичный формат (2.5 = 2ч30м)
          const decimal = parseFloat(match[pattern.minutes]);
          totalMinutes += Math.round(decimal * 60);
        } else {
          totalMinutes += parseInt(match[pattern.minutes]);
        }
      }
      
      return totalMinutes > 0 ? totalMinutes : null;
    }
  }
  
  return null;
};

/**
 * Парсит естественный ввод для создания события
 */
export const parseEventInput = (input: string): {
  title?: string;
  start?: string;
  end?: string;
  date?: string;
  duration?: number;
} | null => {
  const cleaned = input.trim();
  if (!cleaned) return null;
  
  const result: any = {};
  
  // Поиск времени в формате "в 14:30" или "14:30"
  const timeMatch = cleaned.match(/(?:в\s+)?(\d{1,2}[:.,-]\d{2})/);
  if (timeMatch) {
    const parsedTime = parseTimeInput(timeMatch[1]);
    if (parsedTime) {
      result.start = parsedTime;
      // Убираем время из заголовка
      result.title = cleaned.replace(timeMatch[0], '').trim();
    }
  }
  
  // Поиск продолжительности
  const durationMatch = cleaned.match(/(?:на\s+)?(\d+(?:ч|м|мин|\.|:)\d*)/);
  if (durationMatch) {
    const duration = parseDurationInput(durationMatch[1]);
    if (duration) {
      result.duration = duration;
      // Убираем продолжительность из заголовка
      if (result.title) {
        result.title = result.title.replace(durationMatch[0], '').trim();
      }
    }
  }
  
  // Поиск даты
  const dateMatch = cleaned.match(/(?:на\s+)?(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?|завтра|сегодня|послезавтра|\w+день)/);
  if (dateMatch) {
    const parsedDate = parseDateInput(dateMatch[1]);
    if (parsedDate) {
      result.date = parsedDate.toISOString().split('T')[0];
      // Убираем дату из заголовка
      if (result.title) {
        result.title = result.title.replace(dateMatch[0], '').trim();
      }
    }
  }
  
  // Если заголовок не определен, используем весь input (очищенный)
  if (!result.title) {
    result.title = cleaned
      .replace(/(?:в\s+)?\d{1,2}[:.,-]\d{2}/, '')
      .replace(/(?:на\s+)?\d+(?:ч|м|мин|\.|:)\d*/, '')
      .replace(/(?:на\s+)?(?:\d{1,2}\.\d{1,2}(?:\.\d{2,4})?|завтра|сегодня|послезавтра|\w+день)/, '')
      .trim();
  }
  
  // Очистка заголовка от служебных слов
  if (result.title) {
    result.title = result.title
      .replace(/^(на|в|до)\s+/i, '')
      .replace(/\s+(на|в|до)\s*$/i, '')
      .trim();
  }
  
  return Object.keys(result).length > 0 ? result : null;
};

/**
 * Извлекает теги из текста (слова с #)
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagPattern = /#([a-zA-Zа-яА-Я0-9_]+)/g;
  const matches = text.match(hashtagPattern);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

/**
 * Извлекает упоминания из текста (слова с @)
 */
export const extractMentions = (text: string): string[] => {
  const mentionPattern = /@([a-zA-Zа-яА-Я0-9_]+)/g;
  const matches = text.match(mentionPattern);
  return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
};

/**
 * Очищает текст от тегов и упоминаний
 */
export const cleanTextFromTags = (text: string): string => {
  return text
    .replace(/#[a-zA-Zа-яА-Я0-9_]+/g, '')
    .replace(/@[a-zA-Zа-яА-Я0-9_]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};