import React, { useState } from 'react';
import { AppProvider } from './store/context';
import { Header, Footer } from './components/layout';
import { CalendarView, ListView, TaskView, NotesView } from './components/views';
import { EventForm } from './components/forms';

type ViewType = 'calendar' | 'list' | 'tasks' | 'notes';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />;
      case 'list':
        return <ListView />;
      case 'tasks':
        return <TaskView />;
      case 'notes':
        return <NotesView />;
      default:
        return <CalendarView />;
    }
  };

  const handleEventSave = () => {
    setIsEventFormOpen(false);
    // Логика сохранения будет добавлена позже
  };

  const handleEventCancel = () => {
    setIsEventFormOpen(false);
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onAddEvent={() => setIsEventFormOpen(true)}
        />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          {renderCurrentView()}
        </main>
        
        <Footer />

        <EventForm 
          isOpen={isEventFormOpen}
          onSave={handleEventSave}
          onCancel={handleEventCancel}
        />
      </div>
    </AppProvider>
  );
}

export default App;