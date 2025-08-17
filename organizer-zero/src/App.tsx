import React, { useEffect, useState } from 'react';
import { AppProvider } from './store/context';
import { Header, Footer } from './components/layout';
import { CalendarView, ScheduleView, AnalyticsView, ProfileView, RoadmapView } from './components/views';
import { EventForm } from './components/forms';
import { useNavigation, useModal } from './store/hooks';

const AppContent: React.FC = () => {
  const { activeView } = useNavigation();
  const { isEditModalOpen, selectedTimeBlock, closeEditModal } = useModal();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Проверяем текущую тему
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkTheme(isDark);
      console.log('App - Current theme:', isDark ? 'dark' : 'light');
      console.log('HTML classes:', document.documentElement.className);
    };
    
    checkTheme();
    
    // Слушаем изменения темы
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkTheme 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Header />
      <main className={`flex-1 container mx-auto px-4 py-6 transition-colors duration-300 ${
        isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {renderCurrentView()}
      </main>
      <Footer />
      <EventForm
        isOpen={isEditModalOpen}
        timeBlock={selectedTimeBlock}
        onSave={() => {}}
        onCancel={closeEditModal}
      />
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