// App.tsx - Обновленная версия с модулем безопасности
import React, { useEffect, useState } from 'react';
import { AppProvider } from './store/context';
import { securityManager, useSecurity } from './store/security';
import { settingsManager } from './store/settings';
import { useNavigation, useModal } from './store/hooks';

// Компоненты
import Header from './components/Header';
import SecurityGate from './components/SecurityGate';
import CalendarView from './components/views/CalendarView';
import ProfileView from './components/views/ProfileView';
// import EventForm from './components/forms/EventForm'; // Предполагается, что существует

// Типы
import type { ViewType } from './types';

// Основное приложение (требует аутентификации)
const AuthenticatedApp: React.FC = () => {
  const { activeView } = useNavigation();
  const { isEditModalOpen, selectedTimeBlock, closeEditModal } = useModal();

  // Рендер активного представления
  const renderActiveView = () => {
    switch (activeView) {
      case 'calendar':
        return <CalendarView />;
      case 'profile':
        return <ProfileView />;
      case 'schedule':
        return <div className="p-8 text-center text-slate-400">Расписание (в разработке)</div>;
      case 'week':
        return <div className="p-8 text-center text-slate-400">Недельный вид (в разработке)</div>;
      case 'day':
        return <div className="p-8 text-center text-slate-400">Дневной вид (в разработке)</div>;
      case 'agenda':
        return <div className="p-8 text-center text-slate-400">Агенда (в разработке)</div>;
      case 'library':
        return <div className="p-8 text-center text-slate-400">Библиотека (в разработке)</div>;
      case 'analytics':
        return <div className="p-8 text-center text-slate-400">Аналитика (в разработке)</div>;
      case 'roadmap':
        return <div className="p-8 text-center text-slate-400">Роадмап (в разработке)</div>;
      default:
        return <CalendarView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="relative">
        {renderActiveView()}
      </main>

      {/* Модальное окно редактирования события */}
      {isEditModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closeEditModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-800 text-white rounded-xl border border-slate-700 shadow-2xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedTimeBlock ? 'Редактировать событие' : 'Новое событие'}
                </h2>
                
                {/* Здесь должен быть компонент EventForm */}
                <div className="space-y-4">
                  <div className="text-center text-slate-400 py-8">
                    <p>Форма редактирования событий</p>
                    <p className="text-sm mt-2">(EventForm компонент не предоставлен)</p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div>
              Organizer Zero v3.4 • Модульная архитектура
            </div>
            <div className="flex items-center gap-4">
              <span>Безопасный режим активен</span>
              <span>•</span>
              <span>Все данные локальные</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Компонент-обертка для проверки аутентификации
const AppWithSecurity: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Инициализация настроек темы
    settingsManager.getSettings();

    // Проверка существующей сессии
    const checkExistingSession = () => {
      const authenticated = securityManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsCheckingAuth(false);

      if (authenticated) {
        console.log('Existing valid session found');
      } else {
        console.log('No valid session, showing SecurityGate');
      }
    };

    // Небольшая задержка для плавности загрузки
    const timer = setTimeout(checkExistingSession, 500);

    return () => clearTimeout(timer);
  }, []);

  // Обработчик успешной аутентификации
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    console.log('User successfully authenticated');
  };

  // Подписка на изменения состояния безопасности
  useEffect(() => {
    return securityManager.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });
  }, []);

  // Загрузочный экран
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Organizer Zero</p>
          <p className="text-slate-400 text-sm mt-2">Инициализация безопасности...</p>
        </div>
      </div>
    );
  }

  // Показываем SecurityGate если не аутентифицирован
  if (!isAuthenticated) {
    return <SecurityGate onAuthenticated={handleAuthenticated} />;
  }

  // Показываем основное приложение если аутентифицирован
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
};

// Главный компонент приложения
const App: React.FC = () => {
  return <AppWithSecurity />;
};

export default App;