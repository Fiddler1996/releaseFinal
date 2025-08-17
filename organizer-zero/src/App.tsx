import React from 'react';
import { AppProvider } from './store/context';
import { Header, Footer } from './components/layout';
import { CalendarView, ScheduleView, AnalyticsView, ProfileView, RoadmapView } from './components/views';
import { EventForm } from './components/forms';
import { useNavigation } from './store/hooks';

const AppContent: React.FC = () => {
  const { activeView } = useNavigation();

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {renderCurrentView()}
      </main>
      <Footer />
      {/* EventForm можно интегрировать через useModal в будущем */}
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