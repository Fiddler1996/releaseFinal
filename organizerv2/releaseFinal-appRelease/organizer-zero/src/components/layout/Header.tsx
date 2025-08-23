// components/Header.tsx - Обновленная версия с рабочими темами
import React, { useState } from 'react';
import { useNavigation, useNotifications } from '../store/hooks';
import { useSettings } from '../store/settings';
import { useSecurity } from '../store/security';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  X, 
  Menu, 
  LogOut,
  Shield,
  Clock
} from 'lucide-react';
import { VIEW_CONFIGS } from '../utils/constants';
import type { ViewType } from '../types';

const Header: React.FC = () => {
  const { activeView, setActiveView } = useNavigation();
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  const { settings, toggleTheme, getCurrentTheme } = useSettings();
  const { logout, sessionExpiry, lastActivity } = useSecurity();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme === 'dark';

  // Получаем оставшееся время сессии
  const getSessionTimeRemaining = () => {
    if (!sessionExpiry) return 'Неизвестно';
    
    const remaining = sessionExpiry - Date.now();
    if (remaining <= 0) return 'Истекла';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    logout();
    // Перезагрузка страницы для возврата к SecurityGate
    window.location.reload();
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'auto':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Светлая тема';
      case 'dark':
        return 'Тёмная тема';
      case 'auto':
        return `Авто (${currentTheme === 'dark' ? 'тёмная' : 'светлая'})`;
      default:
        return 'Системная тема';
    }
  };

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-sm ${
      isDark 
        ? 'bg-slate-900/95 border-slate-700' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Логотип и заголовок */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-600' : 'bg-blue-600'
              }`}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-lg ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Organizer Zero
                </h1>
                <p className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  v3.4 • Безопасный режим
                </p>
              </div>
            </div>
          </div>

          {/* Навигация (скрытая на мобильных) */}
          <nav className="hidden md:flex items-center gap-1">
            {Object.entries(VIEW_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveView(key as ViewType)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === key
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={config.description}
              >
                {config.title}
              </button>
            ))}
          </nav>

          {/* Правая панель */}
          <div className="flex items-center gap-2">
            {/* Информация о сессии */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
              isDark 
                ? 'bg-slate-800 text-slate-300' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>Сессия: {getSessionTimeRemaining()}</span>
            </div>

            {/* Переключатель темы */}
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title={getThemeLabel()}
            >
              {getThemeIcon()}
            </button>

            {/* Уведомления */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Панель уведомлений - ИСПРАВЛЕНО ПОЗИЦИОНИРОВАНИЕ */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <div className={`absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-xl shadow-2xl border z-50 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`flex items-center justify-between p-4 border-b ${
                      isDark ? 'border-slate-700' : 'border-gray-200'
                    }`}>
                      <h3 className={`font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Уведомления
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className={`text-sm ${
                            isDark 
                              ? 'text-slate-400 hover:text-slate-300' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Очистить всё
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`p-8 text-center ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Нет новых уведомлений</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${
                                isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </div>
                                <div className={`text-sm mt-1 ${
                                  isDark ? 'text-slate-300' : 'text-gray-600'
                                }`}>
                                  {notification.message}
                                </div>
                                <div className={`text-xs mt-1 ${
                                  isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  {new Date(notification.timestamp).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className={`p-1 rounded ${
                                  isDark 
                                    ? 'hover:bg-slate-600 text-slate-400' 
                                    : 'hover:bg-gray-200 text-gray-500'
                                }`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                  : 'hover:bg-red-50 text-red-600 hover:text-red-700'
              }`}
              title="Выйти из системы"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => setShowMobileMenu(false)} 
            />
            <div className={`absolute top-full left-0 right-0 mt-1 mx-4 rounded-xl shadow-2xl border z-50 md:hidden ${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <nav className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VIEW_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveView(key as ViewType);
                        setShowMobileMenu(false);
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                        activeView === key
                          ? isDark
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div>{config.title}</div>
                      <div className={`text-xs mt-1 opacity-75`}>
                        {config.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Мобильная информация о сессии */}
                <div className={`mt-4 pt-4 border-t ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <div className={`flex items-center justify-between text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    <span>Сессия активна:</span>
                    <span className="font-medium">{getSessionTimeRemaining()}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm mt-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    <span>Тема:</span>
                    <button
                      onClick={handleThemeToggle}
                      className={`flex items-center gap-2 px-2 py-1 rounded ${
                        isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {getThemeIcon()}
                      <span className="text-xs">{getThemeLabel()}</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
                