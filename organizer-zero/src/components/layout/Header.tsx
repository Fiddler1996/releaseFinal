// components/layout/Header.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  List, 
  BarChart3, 
  User, 
  Map, 
  Bell, 
  Settings, 
  Menu,
  X,
  ChevronDown,
  Flame,
  Leaf,
  ClipboardList
} from 'lucide-react';
import { useNavigation, useNotifications, useSettings } from '../../store/hooks';
import { Button } from '../ui';
import type { ViewType, AppMode } from '../../types';

/**
 * Компонент заголовка с навигацией и управлением
 */
export const Header: React.FC = () => {
  const { activeView, mode, setActiveView, setMode } = useNavigation();
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  const { settings, toggleNotifications } = useSettings();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Иконки для видов
  const viewIcons: Record<ViewType, React.ComponentType<{ className?: string }>> = {
    calendar: Calendar,
    schedule: List,
    week: BarChart3,
    day: Calendar,
    agenda: List,
    library: List,
    analytics: BarChart3,
    profile: User,
    roadmap: Map
  };

  // Иконки для режимов
  const modeIcons: Record<AppMode, React.ComponentType<{ className?: string }>> = {
    focus: Flame,
    relax: Leaf,
    planning: ClipboardList
  };

  // Конфигурация видов
  const VIEW_CONFIGS = {
    calendar: { title: 'Календарь', description: 'Месячное представление' },
    schedule: { title: 'Расписание', description: 'Список событий' },
    analytics: { title: 'Аналитика', description: 'Статистика и отчеты' },
    profile: { title: 'Профиль', description: 'Настройки приложения' },
    roadmap: { title: 'Роадмап', description: 'План развития' }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setShowMobileMenu(false);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
  };

  const getModeColor = (modeType: AppMode) => {
    const colors = {
      focus: { bg: 'bg-red-600', text: 'text-red-400' },
      relax: { bg: 'bg-green-600', text: 'text-green-400' },
      planning: { bg: 'bg-blue-600', text: 'text-blue-400' }
    };
    return colors[modeType];
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 mb-6">
      <div className="flex items-center justify-between p-4">
        {/* Logo и заголовок */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-white">
            🎯 Organizer Zero
          </div>
          <div className="hidden sm:block text-sm text-gray-400">
            v3.4 Модульная архитектура
          </div>
        </div>

        {/* Десктопная навигация */}
        <nav className="hidden lg:flex items-center space-x-1">
          {(['calendar', 'schedule', 'analytics', 'profile', 'roadmap'] as ViewType[]).map((view) => {
            const IconComponent = viewIcons[view];
            const config = VIEW_CONFIGS[view as keyof typeof VIEW_CONFIGS];
            const isActive = activeView === view;

            return (
              <Button
                key={view}
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleViewChange(view)}
                icon={IconComponent}
                className={`flex items-center space-x-2 ${
                  isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                aria-label={config?.description || view}
              >
                <span className="hidden xl:inline">{config?.title || view}</span>
              </Button>
            );
          })}
        </nav>

        {/* Режимы работы */}
        <div className="hidden md:flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
          {(['focus', 'relax', 'planning'] as AppMode[]).map((modeOption) => {
            const IconComponent = modeIcons[modeOption];
            const isActive = mode === modeOption;
            const modeColor = getModeColor(modeOption);

            return (
              <Button
                key={modeOption}
                size="sm"
                onClick={() => handleModeChange(modeOption)}
                className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                  isActive 
                    ? `${modeColor.bg} text-white` 
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                aria-label={`Переключить в режим ${modeOption}`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden lg:inline capitalize">
                  {modeOption === 'focus' ? 'Фокус' : 
                   modeOption === 'relax' ? 'Отдых' : 'Планирование'}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Уведомления и настройки */}
        <div className="flex items-center space-x-2">
          {/* Уведомления */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              icon={Bell}
              className="relative"
              aria-label={`${notifications.length} уведомлений`}
            >
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>

            {/* Панель уведомлений */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Уведомления</h3>
                  {notifications.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs"
                    >
                      Очистить все
                    </Button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      Нет новых уведомлений
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              notification.type === 'error' ? 'text-red-400' :
                              notification.type === 'warning' ? 'text-yellow-400' :
                              notification.type === 'success' ? 'text-green-400' :
                              'text-blue-400'
                            }`}>
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-300 mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            icon={X}
                            className="ml-2 w-6 h-6 p-0"
                            aria-label="Закрыть уведомление"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-750">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.notificationsEnabled}
                      onChange={toggleNotifications}
                      className="rounded"
                    />
                    <span>Включить уведомления</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Быстрые настройки */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewChange('profile')}
            icon={Settings}
            aria-label="Настройки"
          />

          {/* Мобильное меню */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            icon={showMobileMenu ? X : Menu}
            className="lg:hidden"
            aria-label="Меню"
          />
        </div>
      </div>

      {/* Мобильная навигация */}
      {showMobileMenu && (
        <>
          {/* Overlay для закрытия меню */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setShowMobileMenu(false)}
          />
          
          <div className="lg:hidden bg-gray-750 border-t border-gray-700 relative z-50">
            <div className="p-4 space-y-2">
              {/* Режимы работы для мобильных */}
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Режим работы</div>
                <div className="flex space-x-2">
                  {(['focus', 'relax', 'planning'] as AppMode[]).map((modeOption) => {
                    const IconComponent = modeIcons[modeOption];
                    const isActive = mode === modeOption;
                    const modeColor = getModeColor(modeOption);

                    return (
                      <Button
                        key={modeOption}
                        size="sm"
                        onClick={() => handleModeChange(modeOption)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded ${
                          isActive 
                            ? `${modeColor.bg} text-white` 
                            : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">
                          {modeOption === 'focus' ? 'Фокус' : 
                           modeOption === 'relax' ? 'Отдых' : 'Планирование'}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Виды для мобильных */}
              <div className="text-sm text-gray-400 mb-2">Навигация</div>
              {(['calendar', 'schedule', 'analytics', 'profile', 'roadmap'] as ViewType[]).map((view) => {
                const IconComponent = viewIcons[view];
                const config = VIEW_CONFIGS[view as keyof typeof VIEW_CONFIGS];
                const isActive = activeView === view;

                return (
                  <Button
                    key={view}
                    variant={isActive ? 'primary' : 'secondary'}
                    onClick={() => handleViewChange(view)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{config?.title || view}</div>
                      <div className="text-sm opacity-75">{config?.description || ''}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Закрытие уведомлений при клике вне */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;