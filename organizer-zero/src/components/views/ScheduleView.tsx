import React from 'react';
import { useCalendar, useNavigation } from '../../store/hooks';
import { Button } from '../ui';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import type { CalendarEvent } from '../../types';

const ScheduleView: React.FC = () => {
  const { currentDate, navigateCalendar, goToToday, getEventsForDate } = useCalendar();
  const { setActiveView } = useNavigation();
  const eventsForDay = getEventsForDate(currentDate);

  return (
    <div className="flex flex-col h-full">
      {/* Навигация по дням */}
      <div className="flex items-center justify-between p-2 border-b">
        <Button onClick={() => navigateCalendar('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-sm font-medium">
          {formatDate(new Date(currentDate), 'long')}
        </div>

        <Button onClick={() => navigateCalendar('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Быстрые действия */}
      <div className="flex items-center justify-between p-2 border-b">
        <Button onClick={goToToday}>Сегодня</Button>
        <Button onClick={() => setActiveView('calendar')}>
          <Calendar className="w-4 h-4 mr-1" /> Календарь
        </Button>
      </div>

      {/* Список событий */}
      <div className="flex-1 overflow-y-auto p-2">
        {eventsForDay.length > 0 ? (
          eventsForDay.map((event: CalendarEvent) => (
            <div
              key={event.id}
              className="border rounded p-2 mb-2 bg-white shadow-sm hover:bg-gray-50 transition"
            >
              <div className="font-medium">{event.title}</div>
              {event.description && (
                <div className="text-xs text-gray-500">{event.description}</div>
              )}
              <div className="text-xs text-gray-400">
                {event.start} — {event.end}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-4 text-sm">
            Нет событий на эту дату
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
