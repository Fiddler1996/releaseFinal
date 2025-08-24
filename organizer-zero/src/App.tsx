import React from 'react';
import { AppProvider } from './store/context';
import { Header, Footer } from './components/layout';
import { CalendarView, ScheduleView, AnalyticsView, ProfileView, RoadmapView } from './components/views';
import { EventForm } from './components/forms';
import { useNavigation, useModal } from './store/hooks';
import { useAppContext } from './store/context';

const LockOverlay: React.FC = () => {
  const { securityManager } = useAppContext();
  const isLocked = securityManager.isLocked();
  const needsAuth = securityManager.needsAuth();
  const [password, setPassword] = React.useState('');
  if (!isLocked) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded p-6 w-full max-w-sm text-center">
        <div className="text-white text-lg font-semibold mb-2">Приложение заблокировано</div>
        <div className="text-gray-300 text-sm mb-4">{needsAuth ? 'Введите пароль для разблокировки' : 'Для продолжения разблокируйте'}</div>
        {needsAuth && (
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        )}
        <button
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          onClick={() => securityManager.unlock(needsAuth ? password : undefined)}
        >
          Разблокировать
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { activeView } = useNavigation();
  const { isEditModalOpen, selectedTimeBlock, closeEditModal } = useModal();
  const { securityManager } = useAppContext();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'calendar':
        return <CalendarView />;
      case 'schedule':
        return <ScheduleView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'profile':
        return <ProfileView />;
      case 'roadmap':
        return <RoadmapView />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" onMouseMove={securityManager.updateActivity} onKeyDown={securityManager.updateActivity}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {renderCurrentView()}
      </main>
      <Footer />
      <EventForm
        isOpen={isEditModalOpen}
        timeBlock={selectedTimeBlock}
        onSave={() => {}}
        onCancel={closeEditModal}
      />
      <LockOverlay />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;