// components/views/AnalyticsView.tsx
import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAnalytics, useTimeBlocks, useCalendar } from '../../store/hooks';
import { Button, LoadingSpinner } from '../ui';
import {
  formatNumber,
  formatPercent,
  formatDuration,
  formatDate
} from '../../utils';
import { EVENT_TYPE_CONFIGS } from '../../utils/constants';
import type { TimeBlockType } from '../../types';

const getTypeColor = (type: TimeBlockType) => {
  const cfg = EVENT_TYPE_CONFIGS[type];
  const [bgClass] = cfg.color.split(' ');
  return { bg: bgClass };
};

const getTypeIcon = (type: TimeBlockType) => EVENT_TYPE_CONFIGS[type].icon;

/**
 * Аналитический вид с метриками и статистикой
 */
export const AnalyticsView: React.FC = () => {
  const analytics = useAnalytics();
  const { timeBlocks, loading } = useTimeBlocks();
  const { getEventsForRange } = useCalendar();
  
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // Вычисляем аналитику за период
  const periodAnalytics = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const events = getEventsForRange(startDate, now);
    const completedEvents = events.filter(e => e.completed);
    const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
    const completedDuration = completedEvents.reduce((sum, e) => sum + e.duration, 0);
    
    return {
      totalEvents: events.length,
      completedEvents: completedEvents.length,
      completionRate: events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0,
      totalDuration,
      completedDuration,
      avgEventDuration: events.length > 0 ? Math.round(totalDuration / events.length) : 0,
      practiceTime: events.filter(e => e.type === 'practice').reduce((sum, e) => sum + e.duration, 0)
    };
  }, [timePeriod, getEventsForRange]);

  // Статистика по типам событий
  const typeStats = useMemo(() => {
    const stats = Object.entries(analytics.eventsByType).map(([type, count]) => ({
      type: type as TimeBlockType,
      count,
      percentage: Math.round((count / analytics.totalEvents) * 100),
      duration: timeBlocks
        .filter(tb => tb.type === type)
        .reduce((sum, tb) => {
          const [startHours, startMinutes] = tb.start.split(':').map(Number);
          const [endHours, endMinutes] = tb.end.split(':').map(Number);
          const startTotal = startHours * 60 + startMinutes;
          const endTotal = endHours * 60 + endMinutes;
          return sum + Math.max(0, endTotal - startTotal);
        }, 0)
    })).sort((a, b) => b.count - a.count);
    
    return stats;
  }, [analytics.eventsByType, analytics.totalEvents, timeBlocks]);

  // Тренды по дням недели
  const weekdayStats = useMemo(() => {
    const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const stats = weekdays.map((day, index) => {
      const dayEvents = timeBlocks.filter(tb => new Date(tb.date).getDay() === index);
      return {
        day,
        count: dayEvents.length,
        completed: dayEvents.filter(e => e.completed).length,
        duration: dayEvents.reduce((sum, e) => {
          const [startHours, startMinutes] = e.start.split(':').map(Number);
          const [endHours, endMinutes] = e.end.split(':').map(Number);
          return sum + Math.max(0, (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes));
        }, 0)
      };
    });
    
    return stats;
  }, [timeBlocks]);

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      period: timePeriod,
      analytics: periodAnalytics,
      typeStats,
      weekdayStats,
      totalEvents: analytics.totalEvents
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizer-analytics-${timePeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            📈 Аналитика
          </h1>
          <p className="text-gray-400">
            Анализ продуктивности и статистика использования времени
          </p>
        </div>

        {/* Управление */}
        <div className="flex items-center space-x-4">
          {/* Выбор периода */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={timePeriod === period ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimePeriod(period)}
                className="px-4"
              >
                {period === 'week' ? 'Неделя' : 
                 period === 'month' ? 'Месяц' : 'Год'}
              </Button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={exportData}
            icon={Download}
            aria-label="Экспорт данных"
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(periodAnalytics.totalEvents)}
          </div>
          <div className="text-sm text-gray-400">
            Событий за {timePeriod === 'week' ? 'неделю' : timePeriod === 'month' ? 'месяц' : 'год'}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-400">
              {periodAnalytics.completionRate}%
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(periodAnalytics.completedEvents)}
          </div>
          <div className="text-sm text-gray-400">Выполнено</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(periodAnalytics.totalDuration / 60)}ч
          </div>
          <div className="text-sm text-gray-400">Общее время</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {periodAnalytics.avgEventDuration}
          </div>
          <div className="text-sm text-gray-400">Мин/событие</div>
        </div>
      </div>

      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика по типам событий */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <PieChart className="w-6 h-6" />
              <span>События по типам</span>
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              icon={showDetailedStats ? Filter : BarChart3}
            >
              {showDetailedStats ? 'Скрыть' : 'Детали'}
            </Button>
          </div>

          <div className="space-y-4">
            {typeStats.map((stat) => {
              const typeColor = getTypeColor(stat.type);
              const typeIcon = getTypeIcon(stat.type);
              
              return (
                <div key={stat.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{typeIcon}</span>
                      <span className="text-white font-medium">
                        {stat.type === 'practice' ? 'Практика' :
                         stat.type === 'concert' ? 'Концерт' :
                         stat.type === 'lesson' ? 'Урок' :
                         stat.type === 'travel' ? 'Поездка' :
                         stat.type === 'meal' ? 'Еда' :
                         stat.type === 'break' ? 'Перерыв' :
                         stat.type === 'personal' ? 'Личное' : 'Свободное время'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{stat.count}</div>
                      <div className="text-xs text-gray-400">{stat.percentage}%</div>
                    </div>
                  </div>
                  
                  {/* Прогресс бар */}
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${typeColor.bg}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  
                  {showDetailedStats && (
                    <div className="text-sm text-gray-400 ml-8">
                      Общее время: {Math.round(stat.duration / 60)}ч {stat.duration % 60}мин
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Активность по дням недели */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Активность по дням</span>
          </h3>

          <div className="space-y-4">
            {weekdayStats.map((stat, index) => {
              const maxCount = Math.max(...weekdayStats.map(s => s.count));
              const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
              const isWeekend = index === 0 || index === 6;
              
              return (
                <div key={stat.day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium w-8 ${
                        isWeekend ? 'text-yellow-400' : 'text-gray-300'
                      }`}>
                        {stat.day}
                      </span>
                      <span className="text-white">{stat.count} событий</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-green-400">{stat.completed} выполнено</div>
                      <div className="text-gray-400">{Math.round(stat.duration / 60)}ч</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        isWeekend ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Достижения и цели */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Достижения */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Award className="w-6 h-6" />
            <span>Достижения</span>
          </h3>

          <div className="space-y-4">
            {/* Первое событие */}
            <div className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Первые шаги</div>
                <div className="text-sm text-gray-400">Создано первое событие</div>
              </div>
              <div className="text-2xl"></div>
            </div>

            {/* Продуктивность */}
            {analytics.completionRate >= 80 && (
              <div className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Высокая продуктивность</div>
                  <div className="text-sm text-gray-400">Выполнено 80%+ событий</div>
                </div>
                <div className="text-2xl">⚡</div>
              </div>
            )}

            {/* Практика */}
            {analytics.practiceEvents >= 10 && (
              <div className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Музыкант</div>
                  <div className="text-sm text-gray-400">10+ практических занятий</div>
                </div>
                <div className="text-2xl">🎹</div>
              </div>
            )}

            {/* Планирование */}
            {analytics.totalEvents >= 50 && (
              <div className="flex items-center space-x-4 p-4 bg-gray-750 rounded-lg">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Планировщик</div>
                  <div className="text-sm text-gray-400">50+ запланированных событий</div>
                </div>
                <div className="text-2xl">📅</div>
              </div>
            )}
          </div>
        </div>

        {/* Прогресс и цели */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Target className="w-6 h-6" />
            <span>Прогресс и цели</span>
          </h3>

          <div className="space-y-6">
            {/* Общий прогресс */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Общее выполнение</span>
                <span className="text-lg font-bold text-blue-400">
                  {analytics.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.completionRate}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {analytics.completedEvents} из {analytics.totalEvents} событий
              </div>
            </div>

            {/* Цель практики */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Практика (цель: 20ч/месяц)</span>
                <span className="text-lg font-bold text-purple-400">
                  {Math.round(periodAnalytics.practiceTime / 60)}ч
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (periodAnalytics.practiceTime / (20 * 60)) * 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {periodAnalytics.practiceTime} из 1200 минут
              </div>
            </div>

            {/* Регулярность */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Регулярность</span>
                <span className="text-lg font-bold text-yellow-400">
                  {Math.round((periodAnalytics.totalEvents / 30) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (periodAnalytics.totalEvents / 30) * 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Среднее: {Math.round(periodAnalytics.totalEvents / 30)} событий/день
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Детальная статистика */}
      {loading.isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Загружаем аналитику..." />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Подробная статистика</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Эффективность */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-white">Эффективность</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Выполненное время:</span>
                  <span className="text-green-400">{Math.round(periodAnalytics.completedDuration / 60)}ч</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Запланированное время:</span>
                  <span className="text-blue-400">{Math.round(periodAnalytics.totalDuration / 60)}ч</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Эффективность:</span>
                  <span className="text-white font-semibold">
                    {formatPercent(periodAnalytics.completedDuration, periodAnalytics.totalDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Время практики */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-white">Практика</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Время практики:</span>
                  <span className="text-purple-400">{Math.round(periodAnalytics.practiceTime / 60)}ч</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Средняя сессия:</span>
                  <span className="text-purple-400">
                    {analytics.practiceEvents > 0 
                      ? Math.round(periodAnalytics.practiceTime / analytics.practiceEvents) 
                      : 0} мин
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Прогресс к цели:</span>
                  <span className="text-white font-semibold">
                    {Math.round((periodAnalytics.practiceTime / (20 * 60)) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Тренды */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-white">Тренды</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Активные дни:</span>
                  <span className="text-green-400 flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{weekdayStats.filter(s => s.count > 0).length}/7</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Самый продуктивный:</span>
                  <span className="text-yellow-400">
                    {weekdayStats.reduce((max, stat) => 
                      stat.count > max.count ? stat : max, weekdayStats[0]
                    ).day}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Среднее время/день:</span>
                  <span className="text-blue-400">
                    {Math.round(periodAnalytics.totalDuration / 7 / 60)}ч
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Рекомендации */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertCircle className="w-6 h-6" />
          <span>Рекомендации</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Рекомендации на основе данных */}
          {analytics.completionRate < 60 && (
            <div className="p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-400">Низкая продуктивность</span>
              </div>
              <p className="text-sm text-yellow-100">
                Попробуйте планировать меньше событий, но выполнять их более качественно
              </p>
            </div>
          )}

          {periodAnalytics.practiceTime < 300 && ( // меньше 5 часов практики
            <div className="p-4 bg-purple-900 border border-purple-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-purple-400">Мало практики</span>
              </div>
              <p className="text-sm text-purple-100">
                Рекомендуем увеличить время практики до 1-2 часов в день
              </p>
            </div>
          )}

          {weekdayStats.filter(s => s.count === 0).length > 3 && (
            <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-400">Неравномерность</span>
              </div>
              <p className="text-sm text-blue-100">
                Попробуйте распределить события более равномерно по дням недели
              </p>
            </div>
          )}

          {periodAnalytics.avgEventDuration > 180 && ( // больше 3 часов на событие
            <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Длинные события</span>
              </div>
              <p className="text-sm text-red-100">
                Рассмотрите возможность разбиения длинных событий на более короткие блоки
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Экспорт и дополнительные действия */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="secondary"
            onClick={exportData}
            icon={Download}
            className="flex items-center space-x-2"
          >
            Экспорт аналитики
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            icon={RefreshCw}
            className="flex items-center space-x-2"
          >
            Обновить данные
          </Button>
          
          <div className="text-sm text-gray-400">
            Последнее обновление: {new Date().toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;  