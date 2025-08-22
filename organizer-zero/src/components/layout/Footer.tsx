// components/layout/Footer.tsx
import React from 'react';
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
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="p-4">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          {/* Общая статистика */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-400">
              <Calendar className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.totalEvents)}</span>
            </div>
            <div className="text-xs text-gray-400">Всего событий</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.completedEvents)}</span>
            </div>
            <div className="text-xs text-gray-400">Выполнено</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-semibold">{analytics.completionRate}%</span>
            </div>
            <div className="text-xs text-gray-400">Процент выполнения</div>
          </div>

          {/* События сегодня и завтра */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-purple-400">
              <Zap className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.todayEvents)}</span>
            </div>
            <div className="text-xs text-gray-400">Сегодня</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-indigo-400">
              <Coffee className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.tomorrowEvents)}</span>
            </div>
            <div className="text-xs text-gray-400">Завтра</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-pink-400">
              <Heart className="w-4 h-4" />
              <span className="text-lg font-semibold">{formatNumber(analytics.practiceEvents)}</span>
            </div>
            <div className="text-xs text-gray-400">Практика</div>
          </div>
        </div>

        {/* Быстрые действия и информация */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Левая часть - быстрые действия */}
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleQuickAdd}
              icon={Plus}
              loading={loading.isLoading}
              disabled={loading.isLoading}
              aria-label="Быстро добавить событие"
            >
              <span className="hidden sm:inline">Добавить событие</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleTodayClick}
              icon={Calendar}
              aria-label="Перейти к сегодняшнему дню в календаре"
            >
              <span className="hidden sm:inline">Сегодня</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCalendarClick}
              icon={Calendar}
              aria-label="Открыть календарь"
            >
              <span className="hidden md:inline">Календарь</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAnalyticsClick}
              icon={Zap}
              aria-label="Открыть аналитику"
            >
              <span className="hidden md:inline">Аналитика</span>
            </Button>
          </div>

          {/* Центральная часть - статус загрузки */}
          {loading.isLoading && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span className="text-sm">{loading.loadingText || 'Загрузка...'}</span>
            </div>
          )}

          {/* Правая часть - информация о приложении */}
          <div className="flex-1 flex flex-col items-center text-sm text-gray-400">
            {/* Версия и статус */}
            <div className="hidden lg:flex items-center space-x-2 mb-2">
              <span>Organizer Zero v3.4</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Онлайн"></span>
            </div>

            {/* Ссылки */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => window.open('https://github.com/organizer-zero', '_blank')}
                className="hover:text-white transition-colors flex items-center space-x-1"
                aria-label="GitHub репозиторий"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </button>
              
              <button
                onClick={() => setActiveView('roadmap')}
                className="hover:text-white transition-colors"
                aria-label="Открыть роадмап"
              >
                Роадмап
              </button>
              
              <button
                onClick={() => setActiveView('profile')}
                className="hover:text-white transition-colors"
                aria-label="Открыть справку"
              >
                Справка
              </button>
            </div>

            {/* Время последнего обновления */}
            <div className="hidden xl:block text-xs mt-2">
              Обновлено: {new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Прогресс бар выполнения задач (если есть события) */}
        {analytics.totalEvents > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Прогресс выполнения</span>
              <span>{formatPercent(analytics.completedEvents, analytics.totalEvents)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analytics.completionRate}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Подсказки для клавиатуры (для десктопа) */}
        <div className="hidden xl:block mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <span><kbd className="px-1 bg-gray-700 rounded">N</kbd> Новое событие</span>
            <span><kbd className="px-1 bg-gray-700 rounded">T</kbd> Сегодня</span>
            <span><kbd className="px-1 bg-gray-700 rounded">F</kbd> Поиск</span>
            <span><kbd className="px-1 bg-gray-700 rounded">Q/W/E</kbd> Режимы</span>
            <span><kbd className="px-1 bg-gray-700 rounded">←/→</kbd> Навигация</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;