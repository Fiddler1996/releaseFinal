// components/forms/QuickAdd.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Send,
  Sparkles,
  Clock,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Button } from '../ui';
import { useTimeBlocks, useNotifications, useCalendar } from '../../store/hooks';
import { parseEventInput } from '../../utils';
import type { QuickAddProps } from '../../types';

/**
 * Компонент быстрого добавления событий с умным парсингом
 */
export const QuickAdd: React.FC<QuickAddProps> = ({
  onAdd,
  placeholder = "Например: Практика фортепиано 9:00-10:30 @музыкальная комната #техника",
  currentDate
}) => {
  const { addTimeBlock, loading } = useTimeBlocks();
  const { addNotification } = useNotifications();
  const { setCurrentDate } = useCalendar();
  
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Парсинг введенного текста
  const parsedEvent = parseEventInput(input);
  const validation = { isValid: !!parsedEvent, errors: parsedEvent ? [] as string[] : ['Не удалось распознать событие'] };

  // Фокус на поле ввода при маунте
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Обработка отправки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      addNotification({
        type: 'warning',
        title: 'Пустое поле',
        message: 'Введите описание события для создания',
        autoRemove: true
      });
      return;
    }

    if (!validation.isValid || !parsedEvent) {
      addNotification({
        type: 'error',
        title: 'Ошибка валидации',
        message: validation.errors[0],
        autoRemove: true
      });
      return;
    }

    try {
      await addTimeBlock(parsedEvent as any);
      
      // Переходим к дате события если она отличается от текущей
      if ((parsedEvent as any).date && (parsedEvent as any).date !== currentDate) {
        setCurrentDate((parsedEvent as any).date);
      }
      
      onAdd(input);
      setInput('');
      setShowPreview(false);
      
      addNotification({
        type: 'success',
        title: 'Событие создано',
        message: `"${(parsedEvent as any).title}" добавлено в календарь`,
        autoRemove: true
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка создания',
        message: 'Не удалось создать событие',
        autoRemove: true
      });
    }
  };

  // Обработка изменения ввода
  const handleInputChange = (value: string) => {
    setInput(value);
    setShowPreview(value.trim().length > 0);
  };

  // Быстрые шаблоны
  const quickTemplates = [
    {
      text: "Практика фортепиано 9:00-10:30 #техника",
      icon: "🎹",
      description: "Музыкальная практика"
    },
    {
      text: "Урок математики 14:00-15:30 @школа",
      icon: "📚", 
      description: "Учебное занятие"
    },
    {
      text: "Обед 12:00-13:00 @кафе",
      icon: "🍽️",
      description: "Перерыв на обед"
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" loading={loading.isLoading} icon={Send} aria-label="Создать событие">
          Создать
        </Button>
      </div>

      {showPreview && parsedEvent && (
        <div className="bg-gray-800 border border-gray-700 rounded p-3 text-sm">
          <div className="flex items-center space-x-2 text-gray-300">
            <Sparkles className="w-4 h-4" />
            <span>Предпросмотр события</span>
          </div>

          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✨</span>
                <span className="text-white font-medium">{(parsedEvent as any).title}</span>
              </div>
              {(parsedEvent as any).date && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{(parsedEvent as any).date}</span>
                </div>
              )}
              {(parsedEvent as any).start && (parsedEvent as any).end && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{(parsedEvent as any).start} - {(parsedEvent as any).end}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {(parsedEvent as any).location && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{(parsedEvent as any).location}</span>
                </div>
              )}
              {(parsedEvent as any).tags && Array.isArray((parsedEvent as any).tags) && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {((parsedEvent as any).tags as string[]).map((tag: string, index: number) => (
                      <span key={`${tag}-${index}`} className="px-2 py-0.5 rounded bg-gray-700 text-gray-200 text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Подсказка по синтаксису */}
      <div className="text-xs text-gray-500 flex items-center space-x-2">
        <HelpCircle className="w-4 h-4" />
        <span>Примеры: "Практика 9:00 1ч", "Встреча завтра 14:00", "Обед 12:00-13:00"</span>
      </div>
    </form>
  );
};