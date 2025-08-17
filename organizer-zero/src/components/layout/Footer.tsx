// components/layout/Footer.tsx
import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  Plus, 
  Zap, 
  Heart, 
  Coffee,
  Github
} from 'lucide-react';
import { useAnalytics, useTimeBlocks, useCalendar, useNavigation } from '../../store/hooks';
import { Button } from '../ui';
import { formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Компонент подвала с статистикой и быстрыми действиями
 */
export const Footer: React.FC = () => {
  const analytics = useAnalytics();
  const { addTimeBlock, loading } = useTimeBlocks();
  const { goToToday } = useCalendar();
  const { setActiveView } = useNavigation();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Проверяем текущую тему
    setIsDarkTheme(document.documentElement.classList.contains('dark'));
    
    // Слушаем изменения темы
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDarkTheme(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  const handleQuickAdd = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);
    
    addTimeBlock({
      title: 'Быстрое событие',
      start: currentTime,
      end: endTime,
      date: now.toISOString().split('T')[0],
      type: 'personal',
      priority: 'medium'
    });
  };

  const handleTodayClick = () => {
    setActiveView('calendar');
    goToToday();
  };

  const handleCalendarClick = () => {
    setActiveView('calendar');
  };

  const handleAnalyticsClick = () => {
    setActiveView('analytics');
  };

  return (
    <footer className={`border-t mt-auto transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          {/* Общая статистика */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-400">
              <Calendar className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.totalEvents)}</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Всего событий</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.completedEvents)}</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Выполнено</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-semibold">{analytics.completionRate}%</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Процент выполнения</div>
          </div>

          {/* События сегодня и завтра */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-purple-400">
              <Zap className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.todayEvents)}</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Сегодня</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-indigo-400">
              <Coffee className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.tomorrowEvents)}</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Завтра</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-red-400">
              <Heart className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.practiceEvents)}</span>
            </div>
            <div className={`text-xs ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>Практика</div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleQuickAdd}
              disabled={loading}
              icon={Plus}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Быстрое событие
            </Button>
            
            <Button
              onClick={handleTodayClick}
              variant="secondary"
              size="sm"
              icon={Calendar}
            >
              Сегодня
            </Button>
            
            <Button
              onClick={handleCalendarClick}
              variant="secondary"
              size="sm"
              icon={Calendar}
            >
              Календарь
            </Button>
            
            <Button
              onClick={handleAnalyticsClick}
              variant="secondary"
              size="sm"
              icon={CheckCircle}
            >
              Аналитика
            </Button>
          </div>

          {/* Информация о проекте */}
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Сделано с</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>в России</span>
            </div>
            
            <a
              href="https://github.com/your-username/organizer-zero"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-1 hover:opacity-80 transition-opacity ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Прогресс выполнения */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={`${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            }`}>Прогресс выполнения</span>
            <span className={`font-medium ${
              isDarkTheme ? 'text-gray-200' : 'text-gray-700'
            }`}>{analytics.completionRate}%</span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analytics.completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;