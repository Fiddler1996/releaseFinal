// components/SecurityGate.tsx
import React, { useState, useEffect } from 'react';
import { useSecurity } from '../store/security';
import { useSettings } from '../store/settings';
import { Lock, Shield, Eye, EyeOff, Loader } from 'lucide-react';

interface SecurityGateProps {
  onAuthenticated: () => void;
}

const SecurityGate: React.FC<SecurityGateProps> = ({ onAuthenticated }) => {
  const { login, isAuthenticated } = useSecurity();
  const { getCurrentTheme } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Проверяем аутентификацию при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      onAuthenticated();
    }
  }, [isAuthenticated, onAuthenticated]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Имитация проверки пароля (в реальном приложении здесь был бы API вызов)
      if (password && password.length >= 1) {
        const success = await login(rememberSession);
        if (success) {
          onAuthenticated();
        } else {
          setError('Ошибка входа в систему');
        }
      } else {
        setError('Пароль не может быть пустым');
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const success = await login(rememberSession);
      if (success) {
        onAuthenticated();
      }
    } catch (err) {
      setError('Не удалось войти');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (password) {
        handleLogin();
      } else {
        handleQuickLogin();
      }
    }
  };

  const theme = getCurrentTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* Фоновый узор */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full opacity-5 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Shield className="w-96 h-96" />
        </div>
        <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full opacity-5 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Lock className="w-96 h-96" />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <div className={`rounded-2xl shadow-2xl p-8 ${
          isDark 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <Shield className={`w-8 h-8 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            
            <h1 className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Organizer Zero
            </h1>
            
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Безопасный доступ к вашему планировщику
            </p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              isDark 
                ? 'bg-red-900/30 text-red-400 border border-red-800' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {error}
            </div>
          )}

          {/* Форма входа */}
          <div className="space-y-4">
            {/* Поле пароля */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Пароль (опционально)
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите пароль или оставьте пустым"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  } focus:outline-none focus:ring-2`}
                  disabled={isLoading}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                    isDark 
                      ? 'text-slate-400 hover:text-slate-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Чекбокс "Запомнить сессию" */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className={`w-4 h-4 rounded border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500/20' 
                    : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500/20'
                } focus:ring-2 focus:outline-none`}
                disabled={isLoading}
              />
              <label 
                htmlFor="remember" 
                className={`ml-3 text-sm cursor-pointer ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                Запомнить на {rememberSession ? '24 часа' : '4 часа'}
              </label>
            </div>

            {/* Кнопки */}
            <div className="space-y-3 pt-2">
              {/* Кнопка входа с паролем */}
              {password && (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                  } disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Вход...
                    </span>
                  ) : (
                    'Войти с паролем'
                  )}
                </button>
              )}

              {/* Кнопка быстрого входа */}
              <button
                onClick={handleQuickLogin}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  password 
                    ? isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    : isDark
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                } disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Вход...
                  </span>
                ) : (
                  password ? 'Войти без пароля' : 'Войти'
                )}
              </button>
            </div>
          </div>

          {/* Информация о безопасности */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDark ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              🔒 Безопасность
            </h3>
            <ul className={`text-xs space-y-1 ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <li>• Все данные хранятся локально в браузере</li>
              <li>• Сессия автоматически истекает через {rememberSession ? '24 часа' : '4 часа'}</li>
              <li>• Пароль используется только для демонстрации</li>
            </ul>
          </div>

          {/* Версия */}
          <div className="text-center mt-6">
            <p className={`text-xs ${
              isDark ? 'text-slate-500' : 'text-gray-400'
            }`}>
              Organizer Zero v3.4 • Модуль безопасности активен
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityGate;