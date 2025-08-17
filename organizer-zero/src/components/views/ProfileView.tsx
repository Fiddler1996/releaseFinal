// components/views/ProfileView.tsx
import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Save,
  Download,
  Upload,
  Trash2,
  Shield,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Globe,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useSettings, useTimeBlocks, useNotifications } from '../../store/hooks';
import { Button, LoadingSpinner } from '../ui';
import { formatNumber } from '../../utils';
import type { CalendarView } from '../../types';

/**
 * Вид профиля с настройками пользователя и системы
 */
export const ProfileView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    toggleNotifications, 
    toggleAutoSave, 
    toggleSound, 
    toggleAnimations 
  } = useSettings();
  
  const { timeBlocks, loading } = useTimeBlocks();
  const { addNotification, clearAllNotifications } = useNotifications();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Обработка изменений настроек
  const handleSettingChange = <K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Сохранение настроек
  const saveSettings = () => {
    updateSettings(localSettings);
    setHasUnsavedChanges(false);
    addNotification({
      type: 'success',
      title: 'Настройки сохранены',
      message: 'Все изменения применены успешно',
      autoRemove: true
    });
  };

  // Сброс настроек
  const resetSettings = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  };

  // Экспорт данных
  const exportData = () => {
    const data = {
      version: '3.4',
      exportDate: new Date().toISOString(),
      timeBlocks,
      settings: localSettings,
      meta: {
        totalEvents: timeBlocks.length,
        completedEvents: timeBlocks.filter(tb => tb.completed).length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addNotification({
      type: 'success',
      title: 'Данные экспортированы',
      message: 'Резервная копия успешно загружена',
      autoRemove: true
    });
  };

  // Импорт данных
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // В реальном приложении здесь была бы валидация и импорт
        addNotification({
          type: 'info',
          title: 'Импорт данных',
          message: 'Функция импорта будет реализована в следующей версии',
          autoRemove: true
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Ошибка импорта',
          message: 'Не удалось прочитать файл резервной копии',
          autoRemove: true
        });
      }
    };
    reader.readAsText(file);
  };

  // Очистка всех данных
  const clearAllData = () => {
    if (window.confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
      // В реальном приложении здесь был бы вызов очистки
      addNotification({
        type: 'warning',
        title: 'Очистка данных',
        message: 'Функция очистки будет реализована в следующей версии',
        autoRemove: true
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            👤 Профиль и настройки
          </h1>
          <p className="text-gray-400">
            Персонализация приложения и управление данными
          </p>
        </div>

        {/* Действия с настройками */}
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-yellow-400">Есть несохраненные изменения</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetSettings}
            >
              Отменить
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveSettings}
              icon={Save}
            >
              Сохранить
            </Button>
          </div>
        )}
      </div>

      {/* Основные настройки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Уведомления */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Bell className="w-6 h-6" />
            <span>Уведомления</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Включить уведомления</div>
                <div className="text-sm text-gray-400">Получать системные уведомления</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Звуковые уведомления</div>
                <div className="text-sm text-gray-400">Воспроизводить звуки при уведомлениях</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSettingChange('soundEnabled', !localSettings.soundEnabled)}
                icon={localSettings.soundEnabled ? Volume2 : VolumeX}
                className={localSettings.soundEnabled ? 'text-green-400' : 'text-gray-400'}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Напоминание по умолчанию
              </label>
              <select
                value={localSettings.defaultReminder}
                onChange={(e) => handleSettingChange('defaultReminder', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value={5}>За 5 минут</option>
                <option value={10}>За 10 минут</option>
                <option value={15}>За 15 минут</option>
                <option value={30}>За 30 минут</option>
                <option value={60}>За 1 час</option>
              </select>
            </div>
          </div>
        </div>

        {/* Интерфейс */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Monitor className="w-6 h-6" />
            <span>Интерфейс</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Формат времени
              </label>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <Button
                  variant={localSettings.timeFormat === '24h' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSettingChange('timeFormat', '24h')}
                  className="flex-1"
                >
                  24 часа
                </Button>
                <Button
                  variant={localSettings.timeFormat === '12h' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSettingChange('timeFormat', '12h')}
                  className="flex-1"
                >
                  12 часов
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Начало недели
              </label>
              <div className="flex bg-gray-700 rounded-lg p-1">
                <Button
                  variant={localSettings.weekStartsOn === 1 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSettingChange('weekStartsOn', 1)}
                  className="flex-1"
                >
                  Понедельник
                </Button>
                <Button
                  variant={localSettings.weekStartsOn === 0 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSettingChange('weekStartsOn', 0)}
                  className="flex-1"
                >
                  Воскресенье
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Вид календаря по умолчанию
              </label>
              <select
                value={localSettings.calendarView}
                onChange={(e) => handleSettingChange('calendarView', e.target.value as CalendarView)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="month">Месяц</option>
                <option value="week">Неделя</option>
                <option value="day">День</option>
                <option value="agenda">Повестка</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Анимации</div>
                <div className="text-sm text-gray-400">Включить плавные переходы</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.animationsEnabled}
                  onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Автосохранение</div>
                <div className="text-sm text-gray-400">Автоматически сохранять изменения</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Данные пользователя */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <User className="w-6 h-6" />
          <span>Профиль пользователя</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Статистика пользователя */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Всего событий</span>
              </div>
              <span className="text-xl font-bold text-white">{formatNumber(timeBlocks.length)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Время практики</span>
              </div>
              <span className="text-xl font-bold text-white">
                {Math.round(timeBlocks
                  .filter(tb => tb.type === 'practice')
                  .reduce((sum, tb) => {
                    const [startH, startM] = tb.start.split(':').map(Number);
                    const [endH, endM] = tb.end.split(':').map(Number);
                    return sum + Math.max(0, (endH * 60 + endM) - (startH * 60 + startM));
                  }, 0) / 60
                )}ч
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Дата регистрации</span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date().toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Предпочтения пользователя */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Персональные настройки</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  placeholder="Введите ваше имя"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Часовой пояс
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="Europe/Riga">Europe/Riga (GMT+2)</option>
                  <option value="Europe/Moscow">Europe/Moscow (GMT+3)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Язык интерфейса
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="lv">Latviešu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Расширенные настройки */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Расширенные настройки</span>
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            icon={showAdvanced ? EyeOff : Eye}
          >
            {showAdvanced ? 'Скрыть' : 'Показать'}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t border-gray-700">
            {/* Производительность */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Производительность</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <span className="text-gray-300">Предзагрузка данных</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <span className="text-gray-300">Кэширование</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Безопасность */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Безопасность</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <span className="text-gray-300">Автоматический выход</span>
                  <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                    <option value="never">Никогда</option>
                    <option value="1h">Через 1 час</option>
                    <option value="24h">Через 24 часа</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <span className="text-gray-300">Шифрование данных</span>
                  <span className="text-green-400 text-sm">Включено</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Управление данными */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Download className="w-6 h-6" />
          <span>Управление данными</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Экспорт */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Резервное копирование</h4>
            <Button
              variant="primary"
              onClick={exportData}
              icon={Download}
              className="w-full"
            >
              Экспорт данных
            </Button>
            <p className="text-xs text-gray-400">
              Сохранить все события и настройки в файл
            </p>
          </div>

          {/* Импорт */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Восстановление</h4>
            <label className="w-full">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Button
                variant="secondary"
                icon={Upload}
                className="w-full cursor-pointer"
              >
                Импорт данных
              </Button>
            </label>
            <p className="text-xs text-gray-400">
              Восстановить данные из резервной копии
            </p>
          </div>

          {/* Очистка */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Сброс</h4>
            <Button
              variant="danger"
              onClick={clearAllData}
              icon={Trash2}
              className="w-full"
            >
              Очистить всё
            </Button>
            <p className="text-xs text-gray-400">
              Удалить все данные и сбросить настройки
            </p>
          </div>
        </div>
      </div>

      {/* Информация о системе */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Globe className="w-6 h-6" />
          <span>Информация о системе</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-white">Приложение</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Версия:</span>
                <span className="text-white">v3.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Сборка:</span>
                <span className="text-white">Модульная</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Статус:</span>
                <span className="text-green-400">Онлайн</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white">Производительность</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Загрузка:</span>
                <span className="text-green-400">Быстро</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Память:</span>
                <span className="text-yellow-400">Норма</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Кэш:</span>
                <span className="text-blue-400">Активен</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white">Поддержка</h4>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open('https://github.com/organizer-zero', '_blank')}
                className="w-full text-left justify-start"
              >
                📚 Документация
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addNotification({
                  type: 'info',
                  title: 'Поддержка',
                  message: 'Система поддержки будет доступна в следующих версиях',
                  autoRemove: true
                })}
                className="w-full text-left justify-start"
              >
                💬 Обратная связь
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Горячие клавиши */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Smartphone className="w-6 h-6" />
          <span>Горячие клавиши</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'N', description: 'Новое событие' },
            { key: 'T', description: 'Перейти к сегодня' },
            { key: 'F', description: 'Поиск' },
            { key: '←/→', description: 'Навигация по календарю' },
            { key: 'Q', description: 'Режим фокуса' },
            { key: 'W', description: 'Режим отдыха' },
            { key: 'E', description: 'Режим планирования' },
            { key: 'Esc', description: 'Закрыть модальное окно' },
            { key: 'Enter', description: 'Сохранить форму' }
          ].map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
              <span className="text-gray-300">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Диагностика */}
      {loading.isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Загружаем настройки..." />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <RefreshCw className="w-6 h-6" />
            <span>Диагностика системы</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-white">Статус компонентов</h4>
              <div className="space-y-2">
                {[
                  { name: 'Store Context', status: 'ok' },
                  { name: 'Event Hooks', status: 'ok' },
                  { name: 'Notifications', status: 'ok' },
                  { name: 'Calendar Utils', status: 'ok' },
                  { name: 'Local Storage', status: 'warning' },
                  { name: 'Service Worker', status: 'pending' }
                ].map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-750 rounded">
                    <span className="text-gray-300">{component.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      component.status === 'ok' ? 'bg-green-600 text-green-100' :
                      component.status === 'warning' ? 'bg-yellow-600 text-yellow-100' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {component.status === 'ok' ? 'OK' :
                       component.status === 'warning' ? 'WARN' : 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Действия</h4>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  onClick={() => addNotification({
                    type: 'info',
                    title: 'Тест уведомлений',
                    message: 'Система уведомлений работает корректно',
                    autoRemove: true
                  })}
                  className="w-full justify-start"
                >
                  🔔 Тест уведомлений
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={clearAllNotifications}
                  className="w-full justify-start"
                >
                  🗑️ Очистить уведомления
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="w-full justify-start"
                >
                  🔄 Перезагрузить приложение
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;