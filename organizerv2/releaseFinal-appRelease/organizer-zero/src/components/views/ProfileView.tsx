// components/views/ProfileView.tsx - Обновленная версия с настройками безопасности
import React, { useState } from 'react';
import { useSettings } from '../../store/settings';
import { useSecurity, getSessionTimeRemaining, getLastActivityInfo } from '../../store/security';
import { useNotifications } from '../../store/hooks';
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Volume2, 
  VolumeX,
  Shield,
  LogOut,
  Clock,
  Download,
  Upload,
  Trash2,
  Lock,
  Activity,
  AlertTriangle
} from 'lucide-react';

const ProfileView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    toggleTheme, 
    getCurrentTheme,
    exportSettings,
    importSettings
  } = useSettings();
  
  const { 
    logout, 
    setAutoLock, 
    autoLockEnabled, 
    autoLockTimeout,
    sessionExpiry,
    lastActivity 
  } = useSecurity();
  
  const { addNotification } = useNotifications();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme === 'dark';

  const handleLogout = () => {
    logout();
    // Перезагрузка для возврата к SecurityGate
    window.location.reload();
  };

  const handleAutoLockToggle = (enabled: boolean) => {
    setAutoLock(enabled, enabled ? 30 : 0);
    addNotification({
      type: 'success',
      title: 'Настройки безопасности',
      message: `Автоблокировка ${enabled ? 'включена' : 'отключена'}`,
      autoRemove: true
    });
  };

  const handleAutoLockTimeoutChange = (timeout: number) => {
    setAutoLock(true, timeout);
    addNotification({
      type: 'info',
      title: 'Автоблокировка',
      message: `Время неактивности изменено на ${timeout} мин`,
      autoRemove: true
    });
  };

  const handleExportSettings = () => {
    try {
      const settingsJson = exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organizer-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Экспорт настроек',
        message: 'Настройки успешно экспортированы',
        autoRemove: true
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка экспорта',
        message: 'Не удалось экспортировать настройки',
        autoRemove: true
      });
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settingsJson = e.target?.result as string;
        const success = importSettings(settingsJson);
        
        if (success) {
          addNotification({
            type: 'success',
            title: 'Импорт настроек',
            message: 'Настройки успешно импортированы',
            autoRemove: true
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Ошибка импорта',
            message: 'Неверный формат файла настроек',
            autoRemove: true
          });
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Ошибка импорта',
          message: 'Не удалось прочитать файл',
          autoRemove: true
        });
      }
    };
    reader.readAsText(file);
    
    // Сброс input
    event.target.value = '';
  };

  const handleResetSettings = () => {
    resetSettings();
    setShowResetConfirm(false);
    addNotification({
      type: 'info',
      title: 'Настройки сброшены',
      message: 'Все настройки возвращены к значениям по умолчанию',
      autoRemove: true
    });
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-3">
          <User className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Профиль и настройки
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Персонализация и управление приложением
            </p>
          </div>
        </div>

        {/* Информация о безопасности */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Безопасность сессии
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Время сессии
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Осталось: {getSessionTimeRemaining()}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Последняя активность
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {getLastActivityInfo()}
              </p>
            </div>
          </div>

          {/* Автоблокировка */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Автоблокировка
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLockEnabled}
                  onChange={(e) => handleAutoLockToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {autoLockEnabled && (
              <div className="ml-7">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Блокировать после неактивности (минуты):
                </label>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => handleAutoLockTimeoutChange(parseInt(e.target.value))}
                  className={`px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={5}>5 минут</option>
                  <option value={15}>15 минут</option>
                  <option value={30}>30 минут</option>
                  <option value={60}>1 час</option>
                  <option value={120}>2 часа</option>
                  <option value={240}>4 часа</option>
                </select>
              </div>
            )}
          </div>

          {/* Кнопка выхода */}
          <div className="mt-6 pt-6 border-t border-slate-600">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Выйти из системы
            </button>
          </div>
        </div>

        {/* Настройки темы */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {getThemeIcon()}
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Внешний вид
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(['light', 'dark', 'auto'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === theme
                    ? isDark
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-blue-500 bg-blue-50'
                    : isDark
                      ? 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {theme === 'light' && <Sun className="w-5 h-5" />}
                  {theme === 'dark' && <Moon className="w-5 h-5" />}
                  {theme === 'auto' && <Monitor className="w-5 h-5" />}
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {theme === 'light' && 'Светлая'}
                    {theme === 'dark' && 'Тёмная'}
                    {theme === 'auto' && 'Системная'}
                  </span>
                </div>
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {theme === 'light' && 'Светлые цвета'}
                  {theme === 'dark' && 'Тёмные цвета'}
                  {theme === 'auto' && 'Следует системе'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Настройки уведомлений */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Уведомления
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Показывать уведомления
                </span>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Получать системные уведомления
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? 
                  <Volume2 className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} /> :
                  <VolumeX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                }
                <div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Звуковые уведомления
                  </span>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Воспроизводить звуки при уведомлениях
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Импорт/Экспорт настроек */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Settings className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Управление настройками
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportSettings}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              Экспорт настроек
            </button>

            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}>
              <Upload className="w-4 h-4" />
              Импорт настроек
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="sr-only"
              />
            </label>

            <button
              onClick={() => setShowResetConfirm(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Сбросить настройки
            </button>
          </div>
        </div>

        {/* Дополнительные настройки */}
        <div className={`rounded-xl border p-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Дополнительные настройки
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Автосохранение
                </span>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Автоматически сохранять изменения
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Анимации
                </span>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Плавные переходы и анимации
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения выхода */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-xl shadow-2xl border p-6 ${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Подтвердите выход
                </h3>
              </div>
              <p className={`text-sm mb-6 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Вы уверены, что хотите выйти из системы? Все несохранённые изменения будут потеряны.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Модальное окно подтверждения сброса */}
      {showResetConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowResetConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-xl shadow-2xl border p-6 ${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Сбросить настройки
                </h3>
              </div>
              <p className={`text-sm mb-6 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Все настройки будут возвращены к значениям по умолчанию. Это действие нельзя отменить.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView;