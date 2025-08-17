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
import { parseEventInput, validateParsedEvent, getTypeIcon } from '../../utils';
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
  const parsedEvent = parseEventInput(input, currentDate);
  const validation = validateParsedEvent(parsedEvent);

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

    if (!validation.isValid) {
      addNotification({
        type: 'error',
        title: 'Ошибка валидации',
        message: validation.errors[0],
        autoRemove: true
      });
      return;
    }

    try {
      await addTimeBlock(parsedEvent);
      
      // Переходим к дате события если она отличается от текущей
      if (parsedEvent.date && parsedEvent.date !== currentDate) {
        setCurrentDate(parsedEvent.date);
      }
      
      onAdd(input);
      setInput('');
      setShowPreview(false);
      
      addNotification({
        type: 'success',
        title: 'Событие создано',
        message: `"${parsedEvent.title}" добавлено в календарь`,
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
      description: "Прием пищи"
    },
    {
      text: "Встреча завтра 10:00-11:00 важно",
      icon: "👥",
      description: "Деловая встреча"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Основная форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {/* Поле ввода */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-gray-700 border rounded-lg px-4 py-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                validation.isValid || !input.trim()
                  ? 'border-gray-600 focus:ring-blue-500'
                  : 'border-red-500 focus:ring-red-500'
              }`}
              disabled={loading.isLoading}
            />
            
            {/* Иконка AI парсинга */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Sparkles className={`w-5 h-5 ${
                input.trim() ? 'text-blue-400 animate-pulse' : 'text-gray-500'
              }`} />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                icon={HelpCircle}
                className="text-gray-400 hover:text-white"
              >
                Помощь
              </Button>
              
              {input.trim() && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={validation.isValid ? Calendar : AlertCircle}
                  className={validation.isValid ? 'text-green-400' : 'text-red-400'}
                >
                  Предпросмотр
                </Button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={loading.isLoading}
              disabled={loading.isLoading || !input.trim() || !validation.isValid}
              className="min-w-[120px]"
            >
              {loading.isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>

        {/* Ошибки валидации */}
        {!validation.isValid && input.trim() && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Ошибки в описании события:</span>
            </div>
            <ul className="mt-2 text-sm text-red-300 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="ml-6">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Предварительный просмотр */}
      {showPreview && validation.isValid && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Предварительный просмотр</span>
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTypeIcon(parsedEvent.type!)}</span>
              <span className="text-white font-medium">{parsedEvent.title}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{parsedEvent.start} - {parsedEvent.end}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(parsedEvent.date!).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            {parsedEvent.location && (
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{parsedEvent.location}</span>
              </div>
            )}

            {parsedEvent.tags && parsedEvent.tags.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {parsedEvent.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-600 text-blue-100 px-2 py-0.5 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Справка по умному парсингу */}
      {showHelp && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-blue-300 mb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Умный парсинг текста</span>
          </h4>
          
          <div className="space-y-4 text-sm text-blue-100">
            <div>
              <strong className="text-blue-200">Время:</strong>
              <div className="ml-4 space-y-1 text-blue-100">
                <div>• <code>9:00-10:30</code> или <code>с 9:00 до 10:30</code></div>
                <div>• <code>в 14:00</code> (автоматически +1 час)</div>
                <div>• <code>from 9:00 to 10:30</code></div>
              </div>
            </div>

            <div>
              <strong className="text-blue-200">Дата:</strong>
              <div className="ml-4 space-y-1 text-blue-100">
                <div>• <code>сегодня</code>, <code>завтра</code>, <code>послезавтра</code></div>
                <div>• <code>понедельник</code>, <code>вторник</code>, и т.д.</div>
                <div>• <code>15.03</code>, <code>15/03</code>, <code>15-03</code></div>
              </div>
            </div>

            <div>
              <strong className="text-blue-200">Локация:</strong>
              <div className="ml-4 text-blue-100">
                • <code>@музыкальная комната</code>, <code>@театр</code>
              </div>
            </div>

            <div>
              <strong className="text-blue-200">Теги:</strong>
              <div className="ml-4 text-blue-100">
                • <code>#практика</code>, <code>#важно</code>, <code>#техника</code>
              </div>
            </div>

            <div>
              <strong className="text-blue-200">Приоритет:</strong>
              <div className="ml-4 text-blue-100">
                • <code>важно</code>, <code>срочно</code> → высокий приоритет
              </div>
            </div>

            <div className="pt-2 border-t border-blue-700">
              <strong className="text-blue-200">Примеры:</strong>
              <div className="ml-4 space-y-1 text-blue-100 font-mono text-xs">
                <div>• "Практика гитары завтра 10:00-11:30 @студия #аккорды важно"</div>
                <div>• "Обед с коллегами пятница 13:00 @ресторан"</div>
                <div>• "Концерт в субботу 19:00-21:00 @филармония #выступление"</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Быстрые шаблоны */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Быстрые шаблоны</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickTemplates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleInputChange(template.text)}
              className="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 hover:border-gray-600 transition-colors text-left"
              disabled={loading.isLoading}
            >
              <span className="text-lg">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {template.description}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {template.text}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};